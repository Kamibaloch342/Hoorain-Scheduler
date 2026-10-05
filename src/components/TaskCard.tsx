import React, { useState } from 'react';
import { 
  Check, 
  ExternalLink, 
  Clock, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  CalendarClock,
  Layers,
  Copy
} from 'lucide-react';
import { Task, Destination } from '../types';
import { PLATFORMS, buildPlatformLaunchData } from '../data/platforms';
import { PlatformIcon } from './PlatformIcon';
import { triggerCompletionConfetti } from '../utils/confetti';

interface TaskCardProps {
  task: Task;
  destination?: Destination;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onReschedule?: (task: Task) => void;
  onNotify: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  destination,
  onToggleComplete,
  onEdit,
  onDelete,
  onReschedule,
  onNotify,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const platform = PLATFORMS[task.platformId];
  const isComplete = task.status === 'completed';
  const isMissed = task.status === 'missed';

  const scheduledDate = new Date(task.scheduledAt);
  const timeFormatted = scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = scheduledDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const handleCompleteToggle = () => {
    onToggleComplete(task.id);
    if (!isComplete) {
      triggerCompletionConfetti();
      onNotify('success', 'Marked as Completed! ✓', `Task "${task.title}" has been completed.`);
    }
  };

  const handleOpenPlatform = () => {
    if (!destination) {
      onNotify('error', 'Destination Not Found', 'Could not locate destination configuration.');
      return;
    }

    const { url, clipboardText, platformName } = buildPlatformLaunchData(destination, task);

    // Copy to clipboard
    if (clipboardText && navigator.clipboard) {
      navigator.clipboard.writeText(clipboardText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        onNotify(
          'info',
          `Copied & Opening ${platformName}`,
          'Post text & hashtags copied to clipboard. Paste into composer to publish!'
        );
      }).catch(() => {
        onNotify('info', `Opening ${platformName}`, 'Opening platform composer in a new tab.');
      });
    }

    // Open target composer in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyContent = () => {
    const text = `${task.content}${task.tags && task.tags.length > 0 ? '\n\n' + task.tags.map(t => `#${t}`).join(' ') : ''}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onNotify('success', 'Copied to Clipboard', 'Post content copied successfully.');
    });
  };

  return (
    <div
      className={`glass-card rounded-2xl p-4 sm:p-5 border transition-all relative ${
        isMissed
          ? 'border-rose-400/60 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/10'
          : isComplete
          ? 'border-emerald-300/60 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10'
          : 'border-slate-200/90 dark:border-slate-800/80'
      }`}
    >
      {/* Top Header: Platform, Destination, Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <PlatformIcon platformId={task.platformId} size={15} />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {platform.name}
            </span>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[180px] sm:max-w-[240px]">
            {destination?.name || 'General Destination'}
          </span>
        </div>

        {/* Status Pill & Menu */}
        <div className="flex items-center gap-2">
          {isMissed && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
              <AlertCircle className="w-3 h-3" />
              Missed
            </span>
          )}

          {isComplete && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              <CheckCircle2 className="w-3 h-3" />
              Done
            </span>
          )}

          {!isComplete && !isMissed && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Clock className="w-3 h-3" />
              Scheduled
            </span>
          )}

          {/* Quick Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-7 z-30 w-36 glass-panel rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 text-xs">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(task);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Edit Post</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleCopyContent();
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Content</span>
                  </button>
                  {isMissed && onReschedule && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onReschedule(task);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400"
                    >
                      <CalendarClock className="w-3.5 h-3.5" />
                      <span>Reschedule</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(task.id);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-t border-slate-100 dark:border-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <h3
        className={`text-sm sm:text-base font-bold mb-1.5 ${
          isComplete
            ? 'line-through text-slate-400 dark:text-slate-500'
            : 'text-slate-900 dark:text-slate-100'
        }`}
      >
        {task.title}
      </h3>

      {/* Content Preview */}
      <p
        className={`text-xs sm:text-sm leading-relaxed mb-3 line-clamp-3 ${
          isComplete
            ? 'text-slate-400 dark:text-slate-500'
            : 'text-slate-600 dark:text-slate-300'
        }`}
      >
        {task.content}
      </p>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {task.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60"
            >
              #{tag.replace(/^#/, '')}
            </span>
          ))}
        </div>
      )}

      {/* Timing & Meta Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {dateFormatted} at {timeFormatted}
          </span>
          {task.postTarget > 1 && (
            <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
              <Layers className="w-3 h-3" />
              Target: {task.postCompletedCount || 0}/{task.postTarget}
            </span>
          )}
        </div>

        {destination?.handleOrGroup && (
          <span className="text-[11px] text-slate-400 truncate max-w-[120px] hidden sm:inline">
            {destination.handleOrGroup}
          </span>
        )}
      </div>

      {/* Primary Actions: Clickable Complete ✓ & Open Platform */}
      <div className="flex items-center gap-2.5">
        {/* Clickable ✓ Complete Button */}
        <button
          onClick={handleCompleteToggle}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold text-xs sm:text-sm transition active:scale-95 border ${
            isComplete
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm shadow-emerald-500/30'
              : isMissed
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
              isComplete
                ? 'bg-white text-emerald-600'
                : 'border-2 border-slate-400 dark:border-slate-500'
            }`}
          >
            {isComplete && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span>{isComplete ? 'Completed ✓' : isMissed ? 'Mark Done & Clear' : 'Mark Complete'}</span>
        </button>

        {/* Open Platform Smart Button */}
        <button
          onClick={handleOpenPlatform}
          className="flex items-center justify-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 transition active:scale-95"
          title={`Copy content and open composer for ${platform.name}`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Open Platform</span>
          <span className="sm:hidden">Open</span>
        </button>
      </div>
    </div>
  );
};
