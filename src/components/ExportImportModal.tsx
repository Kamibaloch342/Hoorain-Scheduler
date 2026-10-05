import React, { useState } from 'react';
import { Download, Upload, FileText, FileSpreadsheet, X, CheckCircle2, Copy } from 'lucide-react';
import { storage } from '../services/storageService';
import { Destination, Task } from '../types';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  destinations: Destination[];
  onRefreshData: () => void;
  onNotify: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  destinations,
  onRefreshData,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'csv'>('json');
  const [importText, setImportText] = useState('');

  if (!isOpen) return null;

  // JSON Export
  const handleExportJson = () => {
    const jsonStr = storage.exportDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hoorain-scheduler-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('success', 'JSON Exported', 'Full application state downloaded successfully.');
  };

  // CSV Export
  const handleExportCsv = () => {
    const csvStr = storage.exportTasksToCsv(tasks, destinations);
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hoorain-scheduled-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('success', 'CSV Exported', 'Scheduled tasks exported to CSV.');
  };

  // Import Action
  const handleImport = () => {
    if (!importText.trim()) {
      onNotify('error', 'Empty Input', 'Please paste data to import.');
      return;
    }

    if (activeTab === 'json') {
      const result = storage.importDataFromJson(importText);
      if (result.success) {
        onNotify('success', 'JSON Imported', result.message);
        onRefreshData();
        onClose();
      } else {
        onNotify('error', 'Import Failed', result.message);
      }
    } else {
      const result = storage.importTasksFromCsv(importText, destinations);
      if (result.success) {
        onNotify('success', 'CSV Imported', result.message);
        onRefreshData();
        onClose();
      } else {
        onNotify('error', 'Import Failed', result.message);
      }
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-xl max-h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Data Portability & Backup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export and import your social schedules in JSON or CSV
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-200/60 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'json'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Full System JSON Backup</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'csv'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV Tasks Spreadsheet</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Export Action Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                {activeTab === 'json' ? 'Download JSON Snapshot' : 'Download Tasks CSV'}
              </h4>
              <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-0.5">
                {activeTab === 'json'
                  ? 'Includes all 25+ destinations, recurring rules, and tasks.'
                  : 'Spreadsheet format with Date, Time, Platform, Destination, and Content.'}
              </p>
            </div>
            <button
              onClick={activeTab === 'json' ? handleExportJson : handleExportCsv}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Import {activeTab.toUpperCase()} Data
              </label>
              <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept={activeTab === 'json' ? '.json' : '.csv'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={6}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder={
                activeTab === 'json'
                  ? 'Paste raw JSON exported backup here or upload a .json file...'
                  : 'Paste CSV rows here (with headers) or upload a .csv file...'
              }
              className="w-full px-3 py-2.5 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Submit Import */}
          <button
            onClick={handleImport}
            className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-md transition active:scale-95"
          >
            Process & Restore {activeTab.toUpperCase()} Data
          </button>
        </div>
      </div>
    </div>
  );
};
