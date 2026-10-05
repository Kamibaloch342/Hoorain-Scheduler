import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { storage } from './storageService';
import { Destination, Task, RecurringRule } from '../types';

const ENV_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const CONFIG_KEY = 'hoorain_supabase_credentials';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

class SupabaseService {
  private client: SupabaseClient | null = null;

  getConfig(): SupabaseConfig {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read Supabase config from storage');
    }
    return {
      url: ENV_URL,
      anonKey: ENV_KEY,
    };
  }

  saveConfig(config: SupabaseConfig): void {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      this.client = null; // reset client to re-instantiate on next call
    } catch (e) {
      console.error('Failed to save Supabase config:', e);
    }
  }

  getClient(): SupabaseClient | null {
    if (this.client) return this.client;

    const { url, anonKey } = this.getConfig();
    if (!url || !anonKey) return null;

    try {
      this.client = createClient(url, anonKey);
      return this.client;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  isConfigured(): boolean {
    const { url, anonKey } = this.getConfig();
    return Boolean(url && anonKey);
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'Supabase URL or Anon Key is missing.' };
    }

    try {
      const { error } = await client.from('destinations').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        return { success: false, message: `Database error: ${error.message}` };
      }
      return { success: true, message: 'Successfully connected to Supabase database!' };
    } catch (e: any) {
      return { success: false, message: `Connection failed: ${e.message || 'Unknown network error'}` };
    }
  }

  async syncLocalToCloud(): Promise<{ success: boolean; message: string }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'Supabase is not configured yet.' };
    }

    try {
      const destinations = storage.getDestinations();
      const tasks = storage.getTasks();
      const rules = storage.getRecurringRules();

      // Upsert destinations
      if (destinations.length > 0) {
        const destRows = destinations.map(d => ({
          id: d.id,
          platform_id: d.platformId,
          name: d.name,
          category: d.category,
          target_url: d.targetUrl,
          handle_or_group: d.handleOrGroup || null,
          avatar_url: d.avatarUrl || null,
          is_active: d.isActive,
          default_post_count_target: d.defaultPostCountTarget,
          notes: d.notes || null,
          updated_at: new Date().toISOString(),
        }));
        const { error: destErr } = await client.from('destinations').upsert(destRows, { onConflict: 'id' });
        if (destErr) throw destErr;
      }

      // Upsert recurring rules
      if (rules.length > 0) {
        const ruleRows = rules.map(r => ({
          id: r.id,
          title: r.title,
          destination_id: r.destinationId,
          frequency: r.frequency,
          days_of_week: r.daysOfWeek,
          time_slots: r.timeSlots,
          posts_per_slot: r.postsPerSlot,
          content_template: r.contentTemplate || null,
          tags: r.tags || [],
          is_active: r.isActive,
          start_date: r.startDate,
          end_date: r.endDate || null,
          updated_at: new Date().toISOString(),
        }));
        const { error: ruleErr } = await client.from('recurring_rules').upsert(ruleRows, { onConflict: 'id' });
        if (ruleErr) throw ruleErr;
      }

      // Upsert tasks
      if (tasks.length > 0) {
        const taskRows = tasks.map(t => ({
          id: t.id,
          destination_id: t.destinationId,
          platform_id: t.platformId,
          title: t.title,
          content: t.content,
          media_urls: t.mediaUrls || [],
          scheduled_at: t.scheduledAt,
          status: t.status,
          completed_at: t.completedAt || null,
          recurring_rule_id: t.recurringRuleId || null,
          post_target: t.postTarget,
          post_completed_count: t.postCompletedCount,
          tags: t.tags || [],
          notes: t.notes || null,
          updated_at: new Date().toISOString(),
        }));
        const { error: taskErr } = await client.from('tasks').upsert(taskRows, { onConflict: 'id' });
        if (taskErr) throw taskErr;
      }

      return {
        success: true,
        message: `Synced ${destinations.length} destinations and ${tasks.length} tasks to Supabase cloud!`,
      };
    } catch (e: any) {
      return { success: false, message: `Sync failed: ${e.message}` };
    }
  }

  async syncCloudToLocal(): Promise<{ success: boolean; message: string }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'Supabase is not configured yet.' };
    }

    try {
      const { data: destData, error: destErr } = await client.from('destinations').select('*');
      if (destErr) throw destErr;

      const { data: ruleData, error: ruleErr } = await client.from('recurring_rules').select('*');
      if (ruleErr) throw ruleErr;

      const { data: taskData, error: taskErr } = await client.from('tasks').select('*');
      if (taskErr) throw taskErr;

      if (destData && destData.length > 0) {
        const mappedDest: Destination[] = destData.map((d: any) => ({
          id: d.id,
          platformId: d.platform_id,
          name: d.name,
          category: d.category,
          targetUrl: d.target_url,
          handleOrGroup: d.handle_or_group,
          avatarUrl: d.avatar_url,
          isActive: d.is_active,
          notes: d.notes,
          defaultPostCountTarget: d.default_post_count_target,
        }));
        storage.saveDestinations(mappedDest);
      }

      if (ruleData && ruleData.length > 0) {
        const mappedRules: RecurringRule[] = ruleData.map((r: any) => ({
          id: r.id,
          title: r.title,
          destinationId: r.destination_id,
          frequency: r.frequency,
          daysOfWeek: r.days_of_week,
          timeSlots: r.time_slots,
          postsPerSlot: r.posts_per_slot,
          contentTemplate: r.content_template,
          tags: r.tags,
          isActive: r.is_active,
          startDate: r.start_date,
          endDate: r.end_date,
        }));
        storage.saveRecurringRules(mappedRules);
      }

      if (taskData && taskData.length > 0) {
        const mappedTasks: Task[] = taskData.map((t: any) => ({
          id: t.id,
          destinationId: t.destination_id,
          platformId: t.platform_id,
          title: t.title,
          content: t.content,
          mediaUrls: t.media_urls,
          scheduledAt: t.scheduled_at,
          status: t.status,
          completedAt: t.completed_at,
          recurringRuleId: t.recurring_rule_id,
          postTarget: t.post_target,
          postCompletedCount: t.post_completed_count,
          tags: t.tags,
          notes: t.notes,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        }));
        storage.saveTasks(mappedTasks);
      }

      return {
        success: true,
        message: `Pulled data from Supabase! (${destData?.length || 0} destinations, ${taskData?.length || 0} tasks)`,
      };
    } catch (e: any) {
      return { success: false, message: `Cloud pull failed: ${e.message}` };
    }
  }
}

export const supabaseService = new SupabaseService();
