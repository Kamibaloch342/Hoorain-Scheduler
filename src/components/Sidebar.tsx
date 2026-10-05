import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarRange, 
  Calendar, 
  Share2, 
  Repeat, 
  Filter
} from 'lucide-react';
import { PlatformId } from '../types';
import { PLATFORMS } from '../data/platforms';
import { PlatformIcon } from './PlatformIcon';

export type ActiveTab = 'dashboard' | 'today' | 'roadmap' | 'calendar' | 'destinations' | 'recurring';

interface SidebarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  todayCount: number;
  missedCount: number;
  selectedPlatform: PlatformId | 'all';
  onSelectPlatform: (platform: PlatformId | 'all') => void;
  destinationsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  todayCount,
  missedCount,
  selectedPlatform,
  onSelectPlatform,
  destinationsCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'today' as ActiveTab,
      label: "Today's Tasks",
      icon: CheckSquare,
      badge: todayCount > 0 ? todayCount : null,
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    },
    {
      id: 'roadmap' as ActiveTab,
      label: 'Weekly Roadmap',
      icon: CalendarRange,
      badge: null,
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Calendar',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'destinations' as ActiveTab,
      label: 'Destinations Hub',
      icon: Share2,
      badge: destinationsCount,
      badgeColor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      id: 'recurring' as ActiveTab,
      label: 'Recurring Rules',
      icon: Repeat,
      badge: null,
    },
  ];

  const platformsList = Object.values(PLATFORMS);

  return (
    <aside className="w-64 flex-shrink-0 glass-panel border-r border-slate-200/80 dark:border-slate-800/80 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        {/* Navigation Items */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Navigation
          </p>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Platform Quick Filter */}
        <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between px-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Filter className="w-3 h-3" />
              Filter by Platform
            </span>
            {selectedPlatform !== 'all' && (
              <button
                onClick={() => onSelectPlatform('all')}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => onSelectPlatform('all')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedPlatform === 'all'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <span>All 6 Networks</span>
              <span className="text-[10px] text-slate-400">All</span>
            </button>

            {platformsList.map(platform => {
              const isSelected = selectedPlatform === platform.id;
              return (
                <button
                  key={platform.id}
                  onClick={() => onSelectPlatform(platform.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isSelected
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PlatformIcon platformId={platform.id} size={15} />
                    <span className="truncate">{platform.name}</span>
                  </div>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Offline Status Badge & Version */}
      <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 px-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Offline-Ready
          </span>
          <span className="font-mono text-[10px]">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
