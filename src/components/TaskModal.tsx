import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Layers, Hash, Sparkles } from 'lucide-react';
import { Task, Destination, PlatformId, TaskStatus } from '../types';
import { PLATFORMS } from '../data/platforms';
import { PlatformIcon } from './PlatformIcon';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  destinations: Destination[];
  taskToEdit?: Task | null;
  defaultDate?: string;
  onNotify: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  destinations,
  taskToEdit,
  defaultDate,
  onNotify,
}) => {
  const [platformId, setPlatformId] = useState<PlatformId>('facebook');
  const [destinationId, setDestinationId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [status, setStatus] = useState<TaskStatus>('scheduled');
  const [postTarget, setPostTarget] = useState<number>(1);
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setPlatformId(taskToEdit.platformId);
      setDestinationId(taskToEdit.destinationId);
      setTitle(taskToEdit.title);
      setContent(taskToEdit.content);
      const d = new Date(taskToEdit.scheduledAt);
      setScheduledDate(d.toISOString().slice(0, 10));
      setScheduledTime(d.toTimeString().slice(0, 5));
      setStatus(taskToEdit.status);
      setPostTarget(taskToEdit.postTarget || 1);
      setTagsInput((taskToEdit.tags || []).join(', '));
      setNotes(taskToEdit.notes || '');
    } else {
      const initialDate = defaultDate || new Date().toISOString().slice(0, 10);
      setScheduledDate(initialDate);
      setScheduledTime('10:00');
      setTitle('');
      setContent('');
      setStatus('scheduled');
      setPostTarget(1);
      setTagsInput('');
      setNotes('');

      // Pick first active destination
      const firstDest = destinations.find(d => d.isActive) || destinations[0];
      if (firstDest) {
        setPlatformId(firstDest.platformId);
        setDestinationId(firstDest.id);
      }
    }
  }, [taskToEdit, defaultDate, destinations, isOpen]);

  // When platform changes, adjust destination selection to match
  const handlePlatformChange = (newPlatform: PlatformId) => {
    setPlatformId(newPlatform);
    const matchingDest = destinations.find(d => d.platformId === newPlatform && d.isActive) 
      || destinations.find(d => d.platformId === newPlatform);
    if (matchingDest) {
      setDestinationId(matchingDest.id);
    }
  };

  if (!isOpen) return null;

  const currentPlatformConfig = PLATFORMS[platformId];
  const charLimit = currentPlatformConfig.characterLimit;
  const charsLeft = charLimit ? charLimit - content.length : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destinationId || !scheduledDate || !scheduledTime) {
      onNotify('error', 'Incomplete Form', 'Please fill in all required scheduling details.');
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const task: Task = {
      id: taskToEdit ? taskToEdit.id : `task-${Date.now()}`,
      destinationId,
      platformId,
      title: title.trim(),
      content: content.trim(),
      scheduledAt,
      status,
      postTarget,
      postCompletedCount: taskToEdit ? taskToEdit.postCompletedCount : 0,
      tags,
      notes: notes.trim() || undefined,
      createdAt: taskToEdit ? taskToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(task);
    onClose();
    onNotify(
      'success',
      taskToEdit ? 'Post Updated' : 'Post Scheduled',
      `"${task.title}" has been saved.`
    );
  };

  const platformDestinations = destinations.filter(d => d.platformId === platformId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-xl max-h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {taskToEdit ? 'Edit Scheduled Post' : 'Schedule New Post'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure timing, target destination, and content payload
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Platform Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Network
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(PLATFORMS).map(([id, cfg]) => {
                const isSelected = platformId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handlePlatformChange(id as PlatformId)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-center transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/60 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <PlatformIcon platformId={id as PlatformId} size={18} />
                    <span className="text-[11px] font-bold truncate max-w-full">
                      {cfg.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Destination Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Target Destination ({platformDestinations.length} available)
            </label>
            <select
              value={destinationId}
              onChange={e => setDestinationId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            >
              {platformDestinations.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.handleOrGroup ? `(${d.handleOrGroup})` : ''} [{d.category}]
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Post Title / Campaign Subject
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Morning Feature Announcement"
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Content & Character Counter */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Post Content
              </label>
              {charsLeft !== null && (
                <span
                  className={`text-[11px] font-mono font-semibold ${
                    charsLeft < 0
                      ? 'text-rose-600'
                      : charsLeft < 50
                      ? 'text-amber-500'
                      : 'text-slate-400'
                  }`}
                >
                  {charsLeft} chars remaining
                </span>
              )}
            </div>
            <textarea
              rows={4}
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your post content here. When clicking 'Open Platform', this will be copied to your clipboard automatically..."
              className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Date, Time & Post Target */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Time
              </label>
              <input
                type="time"
                required
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Post Count Target
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={postTarget}
                onChange={e => setPostTarget(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Tags & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="saas, productivity, news"
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white capitalize"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed / Overdue</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30"
            >
              {taskToEdit ? 'Save Changes' : 'Confirm & Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
