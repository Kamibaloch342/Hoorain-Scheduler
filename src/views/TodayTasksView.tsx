import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  SunMedium, 
  Sun, 
  Moon, 
  Plus, 
  Search, 
  Filter, 
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { Task, Destination, PlatformId, TaskStatus } from '../types';
import { TaskCard } from '../components/TaskCard';

interface TodayTasksViewProps {
  tasks: Task[];
  destinations: Destination[];
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onRescheduleTask: (task: Task) => void;
  onNotify: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  onOpenNewTaskModal: (defaultDate?: string) => void;
  selectedPlatform: PlatformId | 'all';
}

export const TodayTasksView: React.FC<TodayTasksViewProps> = ({
  tasks,
  destinations,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onRescheduleTask,
  onNotify,
  onOpenNewTaskModal,
  selectedPlatform,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  const destMap = new Map(destinations.map(d => [d.id, d]));

  const todayStr = new Date().toISOString().slice(0, 10);
  const nowFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Filter tasks to today (or past missed tasks if user wants to catch up)
  const todayTasks = tasks.filter(t => {
    const isToday = t.scheduledAt.startsWith(todayStr);
    const isMissed = t.status === 'missed'; // also include missed in today's triage view
    if (!isToday && !isMissed) return false;

    // Platform filter
    if (selectedPlatform !== 'all' && t.platformId !== selectedPlatform) return false;

    // Status filter
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchContent = t.content.toLowerCase().includes(q);
      const matchTag = t.tags?.some(tag => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTag) return false;
    }

    return true;
  });

  // Buckets: Morning (<12), Afternoon (12-17), Evening (>=17)
  const morningTasks = todayTasks.filter(t => {
    const hours = new Date(t.scheduledAt).getHours();
    return hours < 12;
  });

  const afternoonTasks = todayTasks.filter(t => {
    const hours = new Date(t.scheduledAt).getHours();
    return hours >= 12 && hours < 17;
  });

  const eveningTasks = todayTasks.filter(t => {
    const hours = new Date(t.scheduledAt).getHours();
    return hours >= 17;
  });

  // Stats for today only
  const strictTodayTasks = tasks.filter(t => t.scheduledAt.startsWith(todayStr));
  const completedToday = strictTodayTasks.filter(t => t.status === 'completed').length;
  const totalToday = strictTodayTasks.length;
  const progressPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>Today's Publishing Agenda</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {nowFormatted}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish, track post counts, and check off scheduled tasks across networks.
          </p>
        </div>

        {/* Progress & Add Post */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Today's Completion
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {completedToday}/{totalToday}{' '}
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                ({progressPct}%)
              </span>
            </div>
            <div className="w-36 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5 ml-auto">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => onOpenNewTaskModal(todayStr)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Post Today</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 w-full sm:w-auto overflow-x-auto">
          {(['all', 'scheduled', 'completed', 'missed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {status === 'all' ? 'All Today & Missed' : status}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search today's posts..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Tasks Queue: Bucketed by Time of Day */}
      {todayTasks.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No tasks found for today
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            You're all clear! Add a new post for today or trigger auto-generation from recurring rules.
          </p>
          <button
            onClick={() => onOpenNewTaskModal(todayStr)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Post for Today</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. Morning Bucket */}
          {morningTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <SunMedium className="w-4 h-4" />
                <span>Morning Dispatch (Before 12:00 PM) • {morningTasks.length} Posts</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {morningTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    destination={destMap.get(task.destinationId)}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onReschedule={onRescheduleTask}
                    onNotify={onNotify}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2. Afternoon Bucket */}
          {afternoonTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                <Sun className="w-4 h-4" />
                <span>Afternoon Window (12:00 PM - 5:00 PM) • {afternoonTasks.length} Posts</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {afternoonTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    destination={destMap.get(task.destinationId)}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onReschedule={onRescheduleTask}
                    onNotify={onNotify}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. Evening Bucket */}
          {eveningTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                <Moon className="w-4 h-4" />
                <span>Evening & Prime Slot (5:00 PM+) • {eveningTasks.length} Posts</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eveningTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    destination={destMap.get(task.destinationId)}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onReschedule={onRescheduleTask}
                    onNotify={onNotify}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
