import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  X,
  Layers
} from 'lucide-react';
import { Task, Destination, PlatformId } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';
import { TaskCard } from '../components/TaskCard';

interface CalendarViewProps {
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

export const CalendarView: React.FC<CalendarViewProps> = ({
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
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);

  const destMap = new Map(destinations.map(d => [d.id, d]));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month and total days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (dayNum: number) => {
    const now = new Date();
    return now.getDate() === dayNum && now.getMonth() === month && now.getFullYear() === year;
  };

  // Calendar cells: empty padding days + actual days
  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  // Filter tasks for the selected day drawer
  const selectedDayTasks = selectedDayDate
    ? tasks.filter(t => {
        if (!t.scheduledAt.startsWith(selectedDayDate)) return false;
        if (selectedPlatform !== 'all' && t.platformId !== selectedPlatform) return false;
        return true;
      })
    : [];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Calendar Header & Month Navigation */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Interactive Publishing Calendar</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {monthName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click any date cell to view scheduled posts or add new content.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={goToToday}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
          >
            Today
          </button>

          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 overflow-hidden">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-2 pt-3">
          {calendarCells.map((dayNum, index) => {
            if (dayNum === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="h-24 sm:h-32 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-transparent opacity-30"
                />
              );
            }

            const dayDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isTodayCell = isToday(dayNum);
            const isSelected = selectedDayDate === dayDateStr;

            const dayTasks = tasks.filter(t => {
              if (!t.scheduledAt.startsWith(dayDateStr)) return false;
              if (selectedPlatform !== 'all' && t.platformId !== selectedPlatform) return false;
              return true;
            });

            return (
              <div
                key={dayDateStr}
                onClick={() => setSelectedDayDate(dayDateStr)}
                className={`h-24 sm:h-32 rounded-2xl p-2 sm:p-2.5 border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/40'
                    : isTodayCell
                    ? 'border-indigo-400 bg-indigo-50/10 dark:bg-indigo-950/10 shadow-sm'
                    : 'border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/40 dark:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                      isTodayCell
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {dayNum}
                  </span>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onOpenNewTaskModal(dayDateStr);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title={`Add post on ${dayDateStr}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Platform Badge Chips in Cell */}
                <div className="flex-1 overflow-hidden mt-1.5 space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] truncate ${
                        task.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : task.status === 'missed'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <PlatformIcon platformId={task.platformId} size={11} />
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}

                  {dayTasks.length > 3 && (
                    <div className="text-[10px] font-semibold text-slate-400 px-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Drawer / Modal */}
      {selectedDayDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-2xl max-h-[85vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Scheduled Itinerary
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(selectedDayDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  • {selectedDayTasks.length} Posts
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onOpenNewTaskModal(selectedDayDate);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Post</span>
                </button>
                <button
                  onClick={() => setSelectedDayDate(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body: Tasks list */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {selectedDayTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No scheduled posts for this date
                  </p>
                  <button
                    onClick={() => onOpenNewTaskModal(selectedDayDate)}
                    className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Schedule a post now
                  </button>
                </div>
              ) : (
                selectedDayTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    destination={destMap.get(task.destinationId)}
                    onToggleComplete={onToggleComplete}
                    onEdit={t => {
                      setSelectedDayDate(null);
                      onEditTask(t);
                    }}
                    onDelete={onDeleteTask}
                    onReschedule={onRescheduleTask}
                    onNotify={onNotify}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
