import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map(toast => {
        let Icon = CheckCircle2;
        let borderClass = 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100';
        let iconColor = 'text-emerald-500';

        if (toast.type === 'error') {
          Icon = XCircle;
          borderClass = 'border-rose-500/40 bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100';
          iconColor = 'text-rose-500';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-amber-500/40 bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-100';
          iconColor = 'text-amber-500';
        } else if (toast.type === 'info') {
          Icon = Info;
          borderClass = 'border-blue-500/40 bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-100';
          iconColor = 'text-blue-500';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all animate-scale-up ${borderClass}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold">{toast.title}</h4>
              <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>
              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={toast.onAction}
                  className="mt-2 text-xs font-medium underline hover:opacity-80"
                >
                  {toast.actionLabel}
                </button>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
