import { Destination, Task, RecurringRule, DashboardMetrics, ExportPayload, PlatformId } from '../types';
import { DEFAULT_DESTINATIONS } from '../data/defaultDestinations';
import { INITIAL_TASKS, DEFAULT_RECURRING_RULES } from '../data/seedData';

const KEYS = {
  DESTINATIONS: 'hoorain_destinations_v1',
  TASKS: 'hoorain_tasks_v1',
  RULES: 'hoorain_rules_v1',
  THEME: 'hoorain_theme_v1',
};

const memoryStore = new Map<string, string>();

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {}
    return memoryStore.get(key) || null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {}
    memoryStore.set(key, value);
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {}
    memoryStore.delete(key);
  }
};

class StorageService {
  // --- Destinations ---
  getDestinations(): Destination[] {
    try {
      const data = safeStorage.getItem(KEYS.DESTINATIONS);
      if (!data) {
        this.saveDestinations(DEFAULT_DESTINATIONS);
        return DEFAULT_DESTINATIONS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load destinations from localStorage:', e);
      return DEFAULT_DESTINATIONS;
    }
  }

  saveDestinations(destinations: Destination[]): void {
    try {
      safeStorage.setItem(KEYS.DESTINATIONS, JSON.stringify(destinations));
    } catch (e) {
      console.error('Failed to save destinations to localStorage:', e);
    }
  }

  saveDestination(destination: Destination): void {
    const list = this.getDestinations();
    const idx = list.findIndex(d => d.id === destination.id);
    if (idx >= 0) {
      list[idx] = destination;
    } else {
      list.push(destination);
    }
    this.saveDestinations(list);
  }

  deleteDestination(id: string): void {
    const list = this.getDestinations().filter(d => d.id !== id);
    this.saveDestinations(list);
  }

  resetDestinationsToDefault(): Destination[] {
    this.saveDestinations(DEFAULT_DESTINATIONS);
    return DEFAULT_DESTINATIONS;
  }

  // --- Tasks ---
  getTasks(): Task[] {
    try {
      const data = safeStorage.getItem(KEYS.TASKS);
      if (!data) {
        this.saveTasks(INITIAL_TASKS);
        return INITIAL_TASKS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load tasks from localStorage:', e);
      return INITIAL_TASKS;
    }
  }

  saveTasks(tasks: Task[]): void {
    try {
      safeStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e);
    }
  }

  saveTask(task: Task): void {
    const list = this.getTasks();
    const idx = list.findIndex(t => t.id === task.id);
    const now = new Date().toISOString();
    const preparedTask: Task = {
      ...task,
      updatedAt: now,
      createdAt: task.createdAt || now,
    };

    if (idx >= 0) {
      list[idx] = preparedTask;
    } else {
      list.unshift(preparedTask);
    }
    this.saveTasks(list);
  }

  deleteTask(id: string): void {
    const list = this.getTasks().filter(t => t.id !== id);
    this.saveTasks(list);
  }

  toggleTaskComplete(id: string): { task: Task | null; newlyCompleted: boolean } {
    const list = this.getTasks();
    const idx = list.findIndex(t => t.id === id);
    if (idx < 0) return { task: null, newlyCompleted: false };

    const task = list[idx];
    const isCurrentlyComplete = task.status === 'completed';
    const newlyCompleted = !isCurrentlyComplete;

    task.status = newlyCompleted ? 'completed' : 'scheduled';
    task.completedAt = newlyCompleted ? new Date().toISOString() : undefined;
    task.postCompletedCount = newlyCompleted ? task.postTarget : 0;
    task.updatedAt = new Date().toISOString();

    list[idx] = task;
    this.saveTasks(list);
    return { task, newlyCompleted };
  }

  // --- Recurring Rules ---
  getRecurringRules(): RecurringRule[] {
    try {
      const data = safeStorage.getItem(KEYS.RULES);
      if (!data) {
        this.saveRecurringRules(DEFAULT_RECURRING_RULES);
        return DEFAULT_RECURRING_RULES;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load recurring rules:', e);
      return DEFAULT_RECURRING_RULES;
    }
  }

  saveRecurringRules(rules: RecurringRule[]): void {
    try {
      safeStorage.setItem(KEYS.RULES, JSON.stringify(rules));
    } catch (e) {
      console.error('Failed to save rules to localStorage:', e);
    }
  }

  saveRecurringRule(rule: RecurringRule): void {
    const list = this.getRecurringRules();
    const idx = list.findIndex(r => r.id === rule.id);
    if (idx >= 0) {
      list[idx] = rule;
    } else {
      list.unshift(rule);
    }
    this.saveRecurringRules(list);
  }

  deleteRecurringRule(id: string): void {
    const list = this.getRecurringRules().filter(r => r.id !== id);
    this.saveRecurringRules(list);
  }

  // --- Missed Task Automatic Detection Engine ---
  runMissedTaskCheck(tasks?: Task[]): { updatedTasks: Task[]; newlyMissedCount: number } {
    const currentTasks = tasks || this.getTasks();
    const now = Date.now();
    let newlyMissedCount = 0;
    let hasChanges = false;

    const updated = currentTasks.map(task => {
      // If task is scheduled and the scheduled time has elapsed, mark missed
      if (task.status === 'scheduled') {
        const schedTime = new Date(task.scheduledAt).getTime();
        if (schedTime < now) {
          hasChanges = true;
          newlyMissedCount++;
          return {
            ...task,
            status: 'missed' as const,
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return task;
    });

    if (hasChanges) {
      this.saveTasks(updated);
    }

    return { updatedTasks: updated, newlyMissedCount };
  }

  // --- Recurring Tasks Expander ---
  generateRecurringTaskInstances(daysAhead = 14): { addedCount: number; tasks: Task[] } {
    const rules = this.getRecurringRules().filter(r => r.isActive);
    const destinations = this.getDestinations();
    const currentTasks = this.getTasks();
    const destMap = new Map(destinations.map(d => [d.id, d]));
    
    const now = new Date();
    const createdTasks: Task[] = [];

    rules.forEach(rule => {
      const dest = destMap.get(rule.destinationId);
      if (!dest) return;

      for (let dayOffset = 0; dayOffset <= daysAhead; dayOffset++) {
        const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
        const dayOfWeek = targetDate.getDay();

        // Check if rule applies to this day of week
        if (!rule.daysOfWeek.includes(dayOfWeek)) continue;

        // For each time slot
        rule.timeSlots.forEach((slot, slotIndex) => {
          const [hoursStr, minutesStr] = slot.split(':');
          const hours = parseInt(hoursStr, 10);
          const minutes = parseInt(minutesStr, 10);

          const scheduledAt = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate(),
            hours,
            minutes,
            0,
            0
          ).toISOString();

          // Check if task already generated for this rule and scheduled time
          const exists = currentTasks.some(
            t => t.recurringRuleId === rule.id && t.scheduledAt === scheduledAt
          ) || createdTasks.some(
            t => t.recurringRuleId === rule.id && t.scheduledAt === scheduledAt
          );

          if (!exists) {
            const taskId = `rec-${rule.id}-${targetDate.toISOString().slice(0, 10)}-s${slotIndex}`;
            const newTask: Task = {
              id: taskId,
              destinationId: dest.id,
              platformId: dest.platformId,
              title: `${rule.title} [Auto]`,
              content: rule.contentTemplate || `Scheduled update for ${dest.name}`,
              scheduledAt,
              status: 'scheduled',
              recurringRuleId: rule.id,
              postTarget: rule.postsPerSlot || 1,
              postCompletedCount: 0,
              tags: rule.tags || [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            createdTasks.push(newTask);
          }
        });
      }
    });

    if (createdTasks.length > 0) {
      const combined = [...currentTasks, ...createdTasks];
      this.saveTasks(combined);
      return { addedCount: createdTasks.length, tasks: combined };
    }

    return { addedCount: 0, tasks: currentTasks };
  }

  // --- Metrics Calculation ---
  calculateMetrics(tasks: Task[], destinations: Destination[]): DashboardMetrics {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const scheduledTasks = tasks.filter(t => t.status === 'scheduled').length;
    const missedTasks = tasks.filter(t => t.status === 'missed').length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTasks = tasks.filter(t => t.scheduledAt.startsWith(todayStr));
    const postsToday = todayTasks.length;
    const postsCompletedToday = todayTasks.filter(t => t.status === 'completed').length;

    const activeDestinations = destinations.filter(d => d.isActive).length;

    const platformBreakdown: DashboardMetrics['platformBreakdown'] = {
      facebook: { total: 0, completed: 0, missed: 0, scheduled: 0 },
      whatsapp: { total: 0, completed: 0, missed: 0, scheduled: 0 },
      x: { total: 0, completed: 0, missed: 0, scheduled: 0 },
      linkedin: { total: 0, completed: 0, missed: 0, scheduled: 0 },
      pinterest: { total: 0, completed: 0, missed: 0, scheduled: 0 },
      meta_business_suite: { total: 0, completed: 0, missed: 0, scheduled: 0 },
    };

    tasks.forEach(t => {
      const plat = platformBreakdown[t.platformId];
      if (plat) {
        plat.total++;
        if (t.status === 'completed') plat.completed++;
        else if (t.status === 'missed') plat.missed++;
        else if (t.status === 'scheduled') plat.scheduled++;
      }
    });

    return {
      totalTasks,
      completedTasks,
      scheduledTasks,
      missedTasks,
      completionRate,
      postsToday,
      postsCompletedToday,
      totalDestinations: destinations.length,
      activeDestinations,
      platformBreakdown,
    };
  }

  // --- Export / Import ---
  exportDataAsJson(): string {
    const payload: ExportPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      destinations: this.getDestinations(),
      tasks: this.getTasks(),
      recurringRules: this.getRecurringRules(),
    };
    return JSON.stringify(payload, null, 2);
  }

  importDataFromJson(jsonStr: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonStr) as ExportPayload;
      if (!data || !Array.isArray(data.destinations) || !Array.isArray(data.tasks)) {
        return { success: false, message: 'Invalid JSON format: missing destinations or tasks arrays.' };
      }
      this.saveDestinations(data.destinations);
      this.saveTasks(data.tasks);
      if (Array.isArray(data.recurringRules)) {
        this.saveRecurringRules(data.recurringRules);
      }
      return { 
        success: true, 
        message: `Successfully imported ${data.destinations.length} destinations and ${data.tasks.length} tasks!` 
      };
    } catch (e: any) {
      return { success: false, message: `Import error: ${e.message || 'Corrupted JSON'}` };
    }
  }

  exportTasksToCsv(tasks: Task[], destinations: Destination[]): string {
    const destMap = new Map(destinations.map(d => [d.id, d.name]));
    const headers = ['ID', 'Date', 'Time', 'Platform', 'Destination', 'Status', 'Title', 'Content', 'Tags', 'PostTarget', 'CompletedCount'];
    
    const rows = tasks.map(t => {
      const dateObj = new Date(t.scheduledAt);
      const dateStr = dateObj.toISOString().slice(0, 10);
      const timeStr = dateObj.toTimeString().slice(0, 5);
      const destName = destMap.get(t.destinationId) || t.destinationId;
      const cleanContent = `"${(t.content || '').replace(/"/g, '""')}"`;
      const cleanTitle = `"${(t.title || '').replace(/"/g, '""')}"`;
      const tagsStr = (t.tags || []).join(';');

      return [
        t.id,
        dateStr,
        timeStr,
        t.platformId,
        `"${destName}"`,
        t.status,
        cleanTitle,
        cleanContent,
        `"${tagsStr}"`,
        t.postTarget,
        t.postCompletedCount,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  importTasksFromCsv(csvStr: string, destinations: Destination[]): { success: boolean; addedCount: number; message: string } {
    try {
      const lines = csvStr.trim().split(/\r?\n/);
      if (lines.length < 2) {
        return { success: false, addedCount: 0, message: 'CSV file is empty or missing headers.' };
      }

      const destByName = new Map(destinations.map(d => [d.name.toLowerCase().trim(), d]));
      const destById = new Map(destinations.map(d => [d.id.toLowerCase().trim(), d]));
      
      const newTasks: Task[] = [];
      const currentTasks = this.getTasks();

      // Simple CSV line parser respecting quotes
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV fields
        const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
        const matches: string[] = [];
        let match;
        while ((match = regex.exec(line)) !== null && matches.length < 15) {
          let val = match[1] || '';
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1).replace(/""/g, '"');
          }
          matches.push(val);
          if (regex.lastIndex === line.length) break;
        }

        if (matches.length < 5) continue;

        const [, dateStr, timeStr, platformRaw, destRaw, statusRaw, titleRaw, contentRaw, tagsRaw, postTargetRaw] = matches;

        const platform = (platformRaw?.toLowerCase().trim() || 'facebook') as PlatformId;
        const destKey = (destRaw || '').toLowerCase().trim();
        const matchedDest = destByName.get(destKey) || destById.get(destKey) || destinations.find(d => d.platformId === platform) || destinations[0];

        const scheduledTime = timeStr ? `${timeStr}:00` : '10:00:00';
        const scheduledAt = dateStr ? new Date(`${dateStr}T${scheduledTime}`).toISOString() : new Date().toISOString();
        const tags = tagsRaw ? tagsRaw.split(';').map(t => t.trim()).filter(Boolean) : [];

        const task: Task = {
          id: `csv-${Date.now()}-${i}`,
          destinationId: matchedDest.id,
          platformId: matchedDest.platformId,
          title: titleRaw || 'Imported Post',
          content: contentRaw || '',
          scheduledAt,
          status: (['scheduled', 'completed', 'missed', 'draft'].includes(statusRaw) ? statusRaw : 'scheduled') as any,
          postTarget: parseInt(postTargetRaw, 10) || 1,
          postCompletedCount: 0,
          tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        newTasks.push(task);
      }

      if (newTasks.length === 0) {
        return { success: false, addedCount: 0, message: 'No valid rows found in CSV.' };
      }

      const combined = [...newTasks, ...currentTasks];
      this.saveTasks(combined);

      return {
        success: true,
        addedCount: newTasks.length,
        message: `Successfully imported ${newTasks.length} tasks from CSV!`,
      };
    } catch (e: any) {
      return { success: false, addedCount: 0, message: `CSV Import error: ${e.message}` };
    }
  }
}

export const storage = new StorageService();
