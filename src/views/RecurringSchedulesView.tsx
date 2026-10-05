import React, { useState } from 'react';
import { 
  Repeat, 
  Plus, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Trash2, 
  X,
  Layers,
  Calendar
} from 'lucide-react';
import { RecurringRule, Destination, FrequencyType } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';

interface RecurringSchedulesViewProps {
  recurringRules: RecurringRule[];
  destinations: Destination[];
  onSaveRule: (rule: RecurringRule) => void;
  onDeleteRule: (id: string) => void;
  onTriggerGenerate: () => void;
  onNotify: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
}

export const RecurringSchedulesView: React.FC<RecurringSchedulesViewProps> = ({
  recurringRules,
  destinations,
  onSaveRule,
  onDeleteRule,
  onTriggerGenerate,
  onNotify,
}) => {
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDestId, setFormDestId] = useState(destinations[0]?.id || '');
  const [formFrequency, setFormFrequency] = useState<FrequencyType>('daily');
  const [formDaysOfWeek, setFormDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [formTimeSlots, setFormTimeSlots] = useState<string>('09:00, 14:00');
  const [formPostsPerSlot, setFormPostsPerSlot] = useState<number>(1);
  const [formTemplate, setFormTemplate] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const destMap = new Map(destinations.map(d => [d.id, d]));

  const daysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const openCreateModal = () => {
    setEditingRule(null);
    setFormTitle('');
    setFormDestId(destinations[0]?.id || '');
    setFormFrequency('daily');
    setFormDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    setFormTimeSlots('09:00');
    setFormPostsPerSlot(1);
    setFormTemplate('');
    setFormTags('marketing, growth');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: RecurringRule) => {
    setEditingRule(rule);
    setFormTitle(rule.title);
    setFormDestId(rule.destinationId);
    setFormFrequency(rule.frequency);
    setFormDaysOfWeek(rule.daysOfWeek);
    setFormTimeSlots(rule.timeSlots.join(', '));
    setFormPostsPerSlot(rule.postsPerSlot);
    setFormTemplate(rule.contentTemplate || '');
    setFormTags((rule.tags || []).join(', '));
    setFormIsActive(rule.isActive);
    setIsModalOpen(true);
  };

  const toggleDayOfWeek = (day: number) => {
    if (formDaysOfWeek.includes(day)) {
      setFormDaysOfWeek(formDaysOfWeek.filter(d => d !== day));
    } else {
      setFormDaysOfWeek([...formDaysOfWeek, day].sort());
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDestId) {
      onNotify('error', 'Incomplete', 'Please provide a title and select a destination.');
      return;
    }

    const slots = formTimeSlots
      .split(',')
      .map(s => s.trim())
      .filter(s => /^\d{1,2}:\d{2}$/.test(s));

    if (slots.length === 0) {
      onNotify('error', 'Invalid Time Slots', 'Please enter time slots formatted like "09:00, 14:30".');
      return;
    }

    const todayDateStr = new Date().toISOString().slice(0, 10);

    const rule: RecurringRule = {
      id: editingRule ? editingRule.id : `rule-${Date.now()}`,
      title: formTitle.trim(),
      destinationId: formDestId,
      frequency: formFrequency,
      daysOfWeek: formDaysOfWeek.length > 0 ? formDaysOfWeek : [1, 2, 3, 4, 5],
      timeSlots: slots,
      postsPerSlot: formPostsPerSlot,
      contentTemplate: formTemplate.trim() || undefined,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      isActive: formIsActive,
      startDate: editingRule ? editingRule.startDate : todayDateStr,
    };

    onSaveRule(rule);
    setIsModalOpen(false);
    onNotify('success', editingRule ? 'Rule Updated' : 'Rule Created', `"${rule.title}" saved.`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Repeat className="w-4 h-4" />
            <span>Automated Recurring Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Recurring Schedules & Cadence Rules
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Define daily, weekday, or custom repeating schedules that automatically populate your pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onTriggerGenerate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition active:scale-95"
            title="Generate upcoming instances for the next 14 days"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Populate 14 Days</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Rule</span>
          </button>
        </div>
      </div>

      {/* Rules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recurringRules.map(rule => {
          const dest = destMap.get(rule.destinationId);

          return (
            <div
              key={rule.id}
              className={`glass-card rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                rule.isActive
                  ? 'border-slate-200/90 dark:border-slate-800'
                  : 'border-slate-200/40 dark:border-slate-800/40 opacity-60'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    {dest && <PlatformIcon platformId={dest.platformId} size={18} />}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      {dest?.name || 'Unassigned'}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      rule.isActive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {rule.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {rule.title}
                </h3>

                {/* Days of Week Pills */}
                <div className="flex items-center gap-1 mb-3">
                  {daysLabels.map((lbl, idx) => {
                    const isIncluded = rule.daysOfWeek.includes(idx);
                    return (
                      <span
                        key={lbl}
                        className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-md ${
                          isIncluded
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {lbl[0]}
                      </span>
                    );
                  })}
                </div>

                {/* Time Slots & Post count */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mb-3">
                  <span className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Slots: {rule.timeSlots.join(', ')}
                  </span>
                  <span className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    {rule.postsPerSlot} post{rule.postsPerSlot > 1 ? 's' : ''}/slot
                  </span>
                </div>

                {rule.contentTemplate && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 mb-3">
                    "{rule.contentTemplate}"
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between mt-2">
                <button
                  onClick={() => {
                    const updated = { ...rule, isActive: !rule.isActive };
                    onSaveRule(updated);
                    onNotify('info', updated.isActive ? 'Rule Activated' : 'Rule Paused', `"${rule.title}" updated.`);
                  }}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition ${
                    rule.isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {rule.isActive ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{rule.isActive ? 'Active Cadence' : 'Paused'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(rule)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit Rule"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete recurring rule "${rule.title}"?`)) {
                        onDeleteRule(rule.id);
                        onNotify('info', 'Deleted', `Rule "${rule.title}" removed.`);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingRule ? 'Edit Recurring Schedule' : 'New Recurring Schedule'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Rule Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Daily Morning X Thread"
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Destination */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Target Destination
                </label>
                <select
                  value={formDestId}
                  onChange={e => setFormDestId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                >
                  {destinations.map(d => (
                    <option key={d.id} value={d.id}>
                      [{d.platformId.toUpperCase()}] {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Days of week selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Repeating Days of the Week
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {daysLabels.map((lbl, idx) => {
                    const isSelected = formDaysOfWeek.includes(idx);
                    return (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => toggleDayOfWeek(idx)}
                        className={`py-2 rounded-xl text-xs font-bold transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots & Posts count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Time Slots (comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={formTimeSlots}
                    onChange={e => setFormTimeSlots(e.target.value)}
                    placeholder="09:00, 14:30"
                    className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Posts Per Slot
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formPostsPerSlot}
                    onChange={e => setFormPostsPerSlot(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Content Template */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Default Content Template
                </label>
                <textarea
                  rows={2}
                  value={formTemplate}
                  onChange={e => setFormTemplate(e.target.value)}
                  placeholder="Template text for generated tasks..."
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30"
                >
                  {editingRule ? 'Update Rule' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
