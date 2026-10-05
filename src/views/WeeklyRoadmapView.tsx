import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarRange, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Layers
} from 'lucide-react';
import { Task, Destination, PlatformId } from '../types';
import { TaskCard } from '../components/TaskCard';

interface WeeklyRoadmapViewProps {
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

export const WeeklyRoadmapView: React.FC<WeeklyRoadmapViewProps> = ({
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
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const destMap = new Map(destinations.map(d => [d.id, d]));

  // Calculate current week starting on Monday
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (currentDayOfWeek + 6) % 7; // days since last Monday

  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);

  // Generate 7 days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const sunday = weekDays[6];

  const formatDateHeader = (d: Date) => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isCurrentDay = (d: Date) => {
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header with Week Range and Controls */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <CalendarRange className="w-4 h-4" />
            <span>Weekly Distribution Roadmap</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatDateHeader(monday)} – {formatDateHeader(sunday)}, {monday.getFullYear()}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            7-day publishing cadence and workload balance across destinations.
          </p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setWeekOffset(0)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
          >
            Current Week
          </button>

          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day Horizontal Swimlane Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-start">
        {weekDays.map(day => {
          const dateStr = day.toISOString().slice(0, 10);
          const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
          const isToday = isCurrentDay(day);

          const dayTasks = tasks.filter(t => {
            if (!t.scheduledAt.startsWith(dateStr)) return false;
            if (selectedPlatform !== 'all' && t.platformId !== selectedPlatform) return false;
            return true;
          }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

          const completedCount = dayTasks.filter(t => t.status === 'completed').length;
          const totalCount = dayTasks.length;

          return (
            <div
              key={dateStr}
              className={`rounded-2xl p-3 sm:p-3.5 border flex flex-col min-h-[420px] transition-all ${
                isToday
                  ? 'border-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                  : 'border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {dayName}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {formatDateHeader(day)}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {totalCount > 0 ? (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        completedCount === totalCount
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {completedCount}/{totalCount}
                    </span>
                  ) : null}

                  <button
                    onClick={() => onOpenNewTaskModal(dateStr)}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"
                    title={`Add post for ${dayName}, ${formatDateHeader(day)}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-0.5">
                {dayTasks.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-[11px] text-slate-400">No posts</p>
                    <button
                      onClick={() => onOpenNewTaskModal(dateStr)}
                      className="mt-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      + Schedule
                    </button>
                  </div>
                ) : (
                  dayTasks.map(task => (
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
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
