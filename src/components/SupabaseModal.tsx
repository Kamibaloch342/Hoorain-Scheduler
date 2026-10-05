import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, CloudUpload, CloudDownload, Copy, X, Key, ShieldCheck } from 'lucide-react';
import { supabaseService, SupabaseConfig } from '../services/supabaseClient';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  onDataSynced: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onNotify,
  onDataSynced,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

  useEffect(() => {
    if (isOpen) {
      const cfg = supabaseService.getConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    supabaseService.saveConfig({ url: url.trim(), anonKey: anonKey.trim() });
    onNotify('success', 'Credentials Saved', 'Supabase configuration stored in local environment.');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    supabaseService.saveConfig({ url: url.trim(), anonKey: anonKey.trim() });
    const res = await supabaseService.testConnection();
    setTesting(false);
    setTestResult(res);
    if (res.success) {
      onNotify('success', 'Connected', res.message);
    } else {
      onNotify('warning', 'Connection Issue', res.message);
    }
  };

  const handlePushToCloud = async () => {
    setSyncing(true);
    const res = await supabaseService.syncLocalToCloud();
    setSyncing(false);
    if (res.success) {
      onNotify('success', 'Synced to Supabase', res.message);
    } else {
      onNotify('error', 'Push Failed', res.message);
    }
  };

  const handlePullFromCloud = async () => {
    setSyncing(true);
    const res = await supabaseService.syncCloudToLocal();
    setSyncing(false);
    if (res.success) {
      onNotify('success', 'Data Retrieved', res.message);
      onDataSynced();
    } else {
      onNotify('error', 'Pull Failed', res.message);
    }
  };

  const sqlSchemaSnippet = `-- Run this in your Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.destinations (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id UUID,
  platform_id TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  category TEXT NOT NULL DEFAULT 'page',
  target_url TEXT NOT NULL,
  handle_or_group VARCHAR(255),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  default_post_count_target INT DEFAULT 1,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id UUID,
  destination_id TEXT REFERENCES public.destinations(id) ON DELETE CASCADE,
  platform_id TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled',
  completed_at TIMESTAMPTZ,
  recurring_rule_id TEXT,
  post_target INT DEFAULT 1,
  post_completed_count INT DEFAULT 0,
  tags TEXT[],
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recurring_rules (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id UUID,
  title VARCHAR(255) NOT NULL,
  destination_id TEXT,
  frequency VARCHAR(50) NOT NULL,
  days_of_week INT[] NOT NULL,
  time_slots TEXT[] NOT NULL,
  posts_per_slot INT DEFAULT 1,
  content_template TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE NOT NULL,
  end_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full schema with RLS and triggers is in supabase/schema.sql`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    onNotify('success', 'Copied to Clipboard', 'SQL schema script ready to paste in Supabase.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-xl max-h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Supabase Integration & Cloud Sync
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Offline-first with seamless cloud PostgreSQL replication
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

        {/* Tab switcher */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-200/60 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            API Credentials & Sync
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            SQL Database Schema DDL
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'config' ? (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Supabase Anon Public API Key
                </label>
                <input
                  type="password"
                  value={anonKey}
                  onChange={e => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              {/* Status Message */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 transition"
                >
                  Save Keys
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
                >
                  {testing ? 'Testing...' : 'Test Connection'}
                </button>
              </div>

              {/* Sync Actions Box */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Replication & Sync
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handlePushToCloud}
                    disabled={syncing}
                    className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-left transition flex items-center gap-2.5"
                  >
                    <CloudUpload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Push to Cloud</div>
                      <div className="text-[10px] text-slate-500">Local &rarr; Supabase</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handlePullFromCloud}
                    disabled={syncing}
                    className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-left transition flex items-center gap-2.5"
                  >
                    <CloudDownload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Pull from Cloud</div>
                      <div className="text-[10px] text-slate-500">Supabase &rarr; Local</div>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  PostgreSQL Schema & RLS Setup
                </span>
                <button
                  onClick={copySqlToClipboard}
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Script</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
                {sqlSchemaSnippet}
              </pre>
              <p className="text-[11px] text-slate-400">
                You can also find the full version with Row Level Security in <code className="text-indigo-400">supabase/schema.sql</code> in the repository.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
