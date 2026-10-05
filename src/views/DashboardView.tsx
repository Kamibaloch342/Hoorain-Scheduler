import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Share2, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { DashboardMetrics, Task, Destination, PlatformId } from '../types';
import { PLATFORMS } from '../data/platforms';
import { PlatformIcon } from '../components/PlatformIcon';
import { TaskCard } from '../components/TaskCard';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  tasks: Task[];
  destinations: Destination[];
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onRescheduleTask: (task: Task) => void;
  onNotify: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  onSelectPlatform: (platform: PlatformId | 'all') => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  tasks,
  destinations,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onRescheduleTask,
  onNotify,
  onSelectPlatform,
  onNavigateToTab,
}) => {
  const destMap = new Map(destinations.map(d => [d.id, d]));

  // Urgent overdue tasks
  const missedTasks = tasks.filter(t => t.status === 'missed');
  
  // Today's upcoming scheduled tasks
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => t.scheduledAt.startsWith(todayStr));
  
  // Next 5 upcoming scheduled tasks overall
  const upcomingTasks = tasks
    .filter(t => t.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl shadow-indigo-950/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Autonomous Social Distribution Command Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Multi-Platform Distribution Matrix
          </h2>
          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed mb-6">
            Orchestrating schedules across Facebook, WhatsApp, X, LinkedIn, Pinterest, and Meta Business Suite across 27 active destinations.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('today')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-900 font-bold text-xs sm:text-sm hover:bg-indigo-50 transition active:scale-95 shadow-lg shadow-black/10"
            >
              <span>View Today's Tasks ({metrics.postsToday})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToTab('roadmap')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-700/60 hover:bg-indigo-700/80 border border-white/20 text-white font-semibold text-xs sm:text-sm transition active:scale-95"
            >
              <span>Weekly Roadmap</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow rings */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500/30 to-pink-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Today's Completion */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today's Output
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.postsCompletedToday}/{metrics.postsToday}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({metrics.postsToday > 0 ? Math.round((metrics.postsCompletedToday / metrics.postsToday) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${metrics.postsToday > 0 ? (metrics.postsCompletedToday / metrics.postsToday) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Metric 2: Completion Rate Overall */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Overall Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.completionRate}%
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {metrics.completedTasks} completed
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.completionRate}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Missed Tasks Alert */}
        <div
          onClick={() => onNavigateToTab('today')}
          className={`glass-card rounded-2xl p-5 border cursor-pointer transition ${
            metrics.missedTasks > 0
              ? 'border-rose-400/80 bg-rose-50/20 dark:bg-rose-950/20'
              : 'border-slate-200/90 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Missed / Overdue
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                metrics.missedTasks > 0
                  ? 'bg-rose-500/20 text-rose-600 pulse-missed'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold ${
                metrics.missedTasks > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {metrics.missedTasks}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {metrics.missedTasks > 0 ? 'Requires attention' : 'All up to date'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {metrics.missedTasks > 0 ? 'Click to resolve overdue posts' : 'No overdue items'}
          </p>
        </div>

        {/* Metric 4: Active Destinations */}
        <div
          onClick={() => onNavigateToTab('destinations')}
          className="glass-card rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Destinations
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.activeDestinations}/{metrics.totalDestinations}
            </span>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
              across 6 networks
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Click to manage destination accounts
          </p>
        </div>
      </div>

      {/* 6 Platform Performance Matrix */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Platform Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribution metrics and scheduled post volume across all 6 networks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {Object.entries(PLATFORMS).map(([id, config]) => {
            const platStats = metrics.platformBreakdown[id as PlatformId] || {
              total: 0,
              completed: 0,
              missed: 0,
              scheduled: 0,
            };
            const pct = platStats.total > 0 ? Math.round((platStats.completed / platStats.total) * 100) : 0;

            return (
              <div
                key={id}
                onClick={() => onSelectPlatform(id as PlatformId)}
                className="glass-card rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400/50 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <PlatformIcon platformId={id as PlatformId} size={22} />
                    <span className="text-[11px] font-bold text-slate-400">{pct}%</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mb-1">
                    {config.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                    <div>{platStats.completed} done • {platStats.scheduled} queue</div>
                    {platStats.missed > 0 && (
                      <div className="text-rose-500 font-semibold">{platStats.missed} missed</div>
                    )}
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: config.brandColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Urgent Missed Posts Section (if any) */}
      {missedTasks.length > 0 && (
        <div className="rounded-3xl p-5 sm:p-6 border border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-rose-500 pulse-missed" />
              <span>Overdue Tasks Requiring Resolution ({missedTasks.length})</span>
            </div>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium hidden sm:inline">
              Automatically flagged by the missed-task detector
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missedTasks.slice(0, 4).map(task => (
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

      {/* Upcoming Scheduled Posts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Upcoming Scheduled Feed
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Next posts ready in queue across destinations
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('calendar')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingTasks.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No upcoming scheduled posts
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Click "+ New Post" or auto-populate recurring schedules to fill your calendar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingTasks.map(task => (
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
        )}
      </div>
    </div>
  );
};
