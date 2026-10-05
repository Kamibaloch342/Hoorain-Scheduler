import React from 'react';
import { LayoutDashboard, CheckSquare, CalendarRange, Calendar, Share2 } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface MobileNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  todayCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onChangeTab, todayCount }) => {
  const items = [
    { id: 'dashboard' as ActiveTab, label: 'Dash', icon: LayoutDashboard },
    { id: 'today' as ActiveTab, label: 'Today', icon: CheckSquare, badge: todayCount },
    { id: 'roadmap' as ActiveTab, label: 'Roadmap', icon: CalendarRange },
    { id: 'calendar' as ActiveTab, label: 'Cal', icon: Calendar },
    { id: 'destinations' as ActiveTab, label: 'Dest', icon: Share2 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-2 flex items-center justify-around">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChangeTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg relative transition ${
              isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
