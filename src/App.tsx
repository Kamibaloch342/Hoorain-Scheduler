import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './views/DashboardView';
import { TodayTasksView } from './views/TodayTasksView';
import { WeeklyRoadmapView } from './views/WeeklyRoadmapView';
import { CalendarView } from './views/CalendarView';
import { DestinationsView } from './views/DestinationsView';
import { RecurringSchedulesView } from './views/RecurringSchedulesView';
import { TaskModal } from './components/TaskModal';
import { ExportImportModal } from './components/ExportImportModal';
import { SupabaseModal } from './components/SupabaseModal';
import { ToastContainer } from './components/Toast';
import { storage } from './services/storageService';
import { Task, Destination, RecurringRule, PlatformId, ToastMessage } from './types';

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskModalDefaultDate, setTaskModalDefaultDate] = useState<string | undefined>();
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('hoorain_theme_mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark || true;
    setDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('hoorain_theme_mode', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Toast notifier helper
  const addToast = useCallback(
    (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newToast: ToastMessage = { id, type, title, message };
      setToasts(prev => [...prev.slice(-3), newToast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Reload data from storage
  const loadFreshData = useCallback(() => {
    const dests = storage.getDestinations();
    const rules = storage.getRecurringRules();
    const currentTasks = storage.getTasks();

    // Run missed task check
    const { updatedTasks, newlyMissedCount } = storage.runMissedTaskCheck(currentTasks);

    setDestinations(dests);
    setRecurringRules(rules);
    setTasks(updatedTasks);

    if (newlyMissedCount > 0) {
      addToast(
        'warning',
        'Missed Tasks Detected',
        `${newlyMissedCount} scheduled post(s) have passed their scheduled time and were marked as missed.`
      );
    }
  }, [addToast]);

  // Initial load
  useEffect(() => {
    loadFreshData();

    // Periodic missed task check every 30 seconds
    const interval = setInterval(() => {
      const { updatedTasks, newlyMissedCount } = storage.runMissedTaskCheck();
      if (newlyMissedCount > 0) {
        setTasks(updatedTasks);
        addToast(
          'warning',
          'Missed Task Alert',
          `${newlyMissedCount} post passed its scheduled time without completion.`
        );
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loadFreshData, addToast]);

  // Task Actions
  const handleToggleComplete = (id: string) => {
    const { task, newlyCompleted } = storage.toggleTaskComplete(id);
    if (task) {
      setTasks(storage.getTasks());
    }
  };

  const handleSaveTask = (task: Task) => {
    storage.saveTask(task);
    setTasks(storage.getTasks());
  };

  const handleDeleteTask = (id: string) => {
    storage.deleteTask(id);
    setTasks(storage.getTasks());
    addToast('info', 'Task Deleted', 'Post removed from schedule.');
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setTaskModalDefaultDate(undefined);
    setIsTaskModalOpen(true);
  };

  const handleRescheduleTask = (task: Task) => {
    setTaskToEdit(task);
    setTaskModalDefaultDate(new Date().toISOString().slice(0, 10));
    setIsTaskModalOpen(true);
  };

  const handleOpenNewTask = (defaultDate?: string) => {
    setTaskToEdit(null);
    setTaskModalDefaultDate(defaultDate);
    setIsTaskModalOpen(true);
  };

  // Destination Actions
  const handleSaveDestination = (dest: Destination) => {
    storage.saveDestination(dest);
    setDestinations(storage.getDestinations());
  };

  const handleDeleteDestination = (id: string) => {
    storage.deleteDestination(id);
    setDestinations(storage.getDestinations());
  };

  const handleResetDestinations = () => {
    const defaults = storage.resetDestinationsToDefault();
    setDestinations(defaults);
  };

  // Recurring Rule Actions
  const handleSaveRule = (rule: RecurringRule) => {
    storage.saveRecurringRule(rule);
    setRecurringRules(storage.getRecurringRules());
  };

  const handleDeleteRule = (id: string) => {
    storage.deleteRecurringRule(id);
    setRecurringRules(storage.getRecurringRules());
  };

  const handleTriggerGenerateRecurring = () => {
    const { addedCount, tasks: updatedTasks } = storage.generateRecurringTaskInstances(14);
    setTasks(updatedTasks);
    if (addedCount > 0) {
      addToast(
        'success',
        'Schedule Generated',
        `Successfully populated ${addedCount} scheduled posts for the next 14 days!`
      );
    } else {
      addToast(
        'info',
        'Pipeline Current',
        'All recurring time slots for the next 14 days are already populated.'
      );
    }
  };

  // Calculations
  const metrics = storage.calculateMetrics(tasks, destinations);
  const missedCount = metrics.missedTasks;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        missedCount={missedCount}
        onOpenNewTaskModal={() => handleOpenNewTask()}
        onOpenExportImportModal={() => setIsExportImportModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onFilterMissedTasks={() => setActiveTab('today')}
        onGenerateRecurring={handleTriggerGenerateRecurring}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          todayCount={metrics.postsToday}
          missedCount={missedCount}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
          destinationsCount={destinations.length}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              tasks={tasks}
              destinations={destinations}
              onToggleComplete={handleToggleComplete}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onRescheduleTask={handleRescheduleTask}
              onNotify={addToast}
              onSelectPlatform={setSelectedPlatform}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'today' && (
            <TodayTasksView
              tasks={tasks}
              destinations={destinations}
              onToggleComplete={handleToggleComplete}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onRescheduleTask={handleRescheduleTask}
              onNotify={addToast}
              onOpenNewTaskModal={handleOpenNewTask}
              selectedPlatform={selectedPlatform}
            />
          )}

          {activeTab === 'roadmap' && (
            <WeeklyRoadmapView
              tasks={tasks}
              destinations={destinations}
              onToggleComplete={handleToggleComplete}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onRescheduleTask={handleRescheduleTask}
              onNotify={addToast}
              onOpenNewTaskModal={handleOpenNewTask}
              selectedPlatform={selectedPlatform}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              destinations={destinations}
              onToggleComplete={handleToggleComplete}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onRescheduleTask={handleRescheduleTask}
              onNotify={addToast}
              onOpenNewTaskModal={handleOpenNewTask}
              selectedPlatform={selectedPlatform}
            />
          )}

          {activeTab === 'destinations' && (
            <DestinationsView
              destinations={destinations}
              onSaveDestination={handleSaveDestination}
              onDeleteDestination={handleDeleteDestination}
              onResetDefaults={handleResetDestinations}
              onNotify={addToast}
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
            />
          )}

          {activeTab === 'recurring' && (
            <RecurringSchedulesView
              recurringRules={recurringRules}
              destinations={destinations}
              onSaveRule={handleSaveRule}
              onDeleteRule={handleDeleteRule}
              onTriggerGenerate={handleTriggerGenerateRecurring}
              onNotify={addToast}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        todayCount={metrics.postsToday}
      />

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        destinations={destinations}
        taskToEdit={taskToEdit}
        defaultDate={taskModalDefaultDate}
        onNotify={addToast}
      />

      {/* Export / Import Modal */}
      <ExportImportModal
        isOpen={isExportImportModalOpen}
        onClose={() => setIsExportImportModalOpen(false)}
        tasks={tasks}
        destinations={destinations}
        onRefreshData={loadFreshData}
        onNotify={addToast}
      />

      {/* Supabase Connection Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onNotify={addToast}
        onDataSynced={loadFreshData}
      />

      {/* Non-blocking Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
