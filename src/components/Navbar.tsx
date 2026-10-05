import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Database, 
  Download, 
  Sparkles,
  CalendarCheck2
} from 'lucide-react';
import { supabaseService } from '../services/supabaseClient';

interface NavbarProps {
  missedCount: number;
  onOpenNewTaskModal: () => void;
  onOpenExportImportModal: () => void;
  onOpenSupabaseModal: () => void;
  onFilterMissedTasks: () => void;
  onGenerateRecurring: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  missedCount,
  onOpenNewTaskModal,
  onOpenExportImportModal,
  onOpenSupabaseModal,
  onFilterMissedTasks,
  onGenerateRecurring,
  darkMode,
  onToggleDarkMode,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isCloudConfigured, setIsCloudConfigured] = useState<boolean>(false);

  useEffect(() => {
    setIsCloudConfigured(supabaseService.isConfigured());
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black text-xl tracking-wider">
          <CalendarCheck2 className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-indigo-200">
              Hoorain Scheduler
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Pro 6-Platform
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {currentTime} • 27 Destinations Ready
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Missed Task Attention Pill */}
        {missedCount > 0 && (
          <button
            onClick={onFilterMissedTasks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 text-xs font-semibold pulse-missed transition hover:scale-105"
            title="Click to view overdue tasks requiring attention"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{missedCount} Missed</span>
          </button>
        )}

        {/* Generate Upcoming Recurring */}
        <button
          onClick={onGenerateRecurring}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
          title="Auto-generate tasks for the next 14 days from active recurring rules"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Auto-Populate</span>
        </button>

        {/* Import/Export */}
        <button
          onClick={onOpenExportImportModal}
          className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
          title="Import or Export JSON / CSV"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Data Port</span>
        </button>

        {/* Supabase Status / Setup */}
        <button
          onClick={onOpenSupabaseModal}
          className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
            isCloudConfigured
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50'
              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}
          title="Supabase Cloud Sync & SQL Schema"
        >
          <Database className={`w-3.5 h-3.5 ${isCloudConfigured ? 'text-emerald-500' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">{isCloudConfigured ? 'Supabase Connected' : 'Supabase Sync'}</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* "+ New Post" button */}
        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>
    </header>
  );
};
