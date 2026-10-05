import React, { useState } from 'react';
import { 
  Share2, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Search, 
  RotateCcw,
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import { Destination, PlatformId, DestinationCategory } from '../types';
import { PLATFORMS } from '../data/platforms';
import { PlatformIcon } from '../components/PlatformIcon';

interface DestinationsViewProps {
  destinations: Destination[];
  onSaveDestination: (dest: Destination) => void;
  onDeleteDestination: (id: string) => void;
  onResetDefaults: () => void;
  onNotify: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  selectedPlatform: PlatformId | 'all';
  onSelectPlatform: (platform: PlatformId | 'all') => void;
}

export const DestinationsView: React.FC<DestinationsViewProps> = ({
  destinations,
  onSaveDestination,
  onDeleteDestination,
  onResetDefaults,
  onNotify,
  selectedPlatform,
  onSelectPlatform,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formPlatform, setFormPlatform] = useState<PlatformId>('facebook');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<DestinationCategory>('page');
  const [formTargetUrl, setFormTargetUrl] = useState('');
  const [formHandle, setFormHandle] = useState('');
  const [formPostTarget, setFormPostTarget] = useState<number>(1);
  const [formNotes, setFormNotes] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const openCreateModal = () => {
    setEditingDest(null);
    setFormPlatform('facebook');
    setFormName('');
    setFormCategory('page');
    setFormTargetUrl('https://');
    setFormHandle('');
    setFormPostTarget(1);
    setFormNotes('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (dest: Destination) => {
    setEditingDest(dest);
    setFormPlatform(dest.platformId);
    setFormName(dest.name);
    setFormCategory(dest.category);
    setFormTargetUrl(dest.targetUrl);
    setFormHandle(dest.handleOrGroup || '');
    setFormPostTarget(dest.defaultPostCountTarget || 1);
    setFormNotes(dest.notes || '');
    setFormIsActive(dest.isActive);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTargetUrl.trim()) {
      onNotify('error', 'Missing Information', 'Please provide a destination name and URL.');
      return;
    }

    const dest: Destination = {
      id: editingDest ? editingDest.id : `dest-${Date.now()}`,
      platformId: formPlatform,
      name: formName.trim(),
      category: formCategory,
      targetUrl: formTargetUrl.trim(),
      handleOrGroup: formHandle.trim() || undefined,
      defaultPostCountTarget: formPostTarget,
      notes: formNotes.trim() || undefined,
      isActive: formIsActive,
    };

    onSaveDestination(dest);
    setIsModalOpen(false);
    onNotify(
      'success',
      editingDest ? 'Destination Updated' : 'Destination Added',
      `"${dest.name}" is now ready for scheduling.`
    );
  };

  const handleToggleActive = (dest: Destination) => {
    const updated = { ...dest, isActive: !dest.isActive };
    onSaveDestination(updated);
    onNotify(
      'info',
      updated.isActive ? 'Destination Activated' : 'Destination Paused',
      `"${dest.name}" status updated.`
    );
  };

  // Filtered destinations
  const filteredDestinations = destinations.filter(dest => {
    if (selectedPlatform !== 'all' && dest.platformId !== selectedPlatform) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = dest.name.toLowerCase().includes(q);
      const matchHandle = (dest.handleOrGroup || '').toLowerCase().includes(q);
      const matchCategory = dest.category.toLowerCase().includes(q);
      if (!matchName && !matchHandle && !matchCategory) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Share2 className="w-4 h-4" />
            <span>Destinations Directory (25+ Configured)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Distribution Channels & Targets
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your pages, groups, channels, profiles, and boards across 6 social networks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (confirm('Reset to the 27 default destinations?')) {
                onResetDefaults();
                onNotify('success', 'Reset Completed', 'Destinations restored to factory defaults.');
              }
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
            title="Reset to 27 defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Platform Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => onSelectPlatform('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              selectedPlatform === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Networks ({destinations.length})
          </button>

          {Object.entries(PLATFORMS).map(([id, config]) => {
            const count = destinations.filter(d => d.platformId === id).length;
            const isSelected = selectedPlatform === id;
            return (
              <button
                key={id}
                onClick={() => onSelectPlatform(id as PlatformId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PlatformIcon platformId={id as PlatformId} size={14} />
                <span>{config.name}</span>
                <span className="text-[10px] text-slate-400">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search 25+ destinations..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDestinations.map(dest => {
          const platform = PLATFORMS[dest.platformId];

          return (
            <div
              key={dest.id}
              className={`glass-card rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                dest.isActive
                  ? 'border-slate-200/90 dark:border-slate-800'
                  : 'border-slate-200/40 dark:border-slate-800/40 opacity-60'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platformId={dest.platformId} size={20} />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {platform.name}
                    </span>
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                    {dest.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Destination Name */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {dest.name}
                </h3>

                {dest.handleOrGroup && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-2 truncate">
                    {dest.handleOrGroup}
                  </p>
                )}

                {dest.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {dest.notes}
                  </p>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between mt-3">
                {/* Active Toggle Switch */}
                <button
                  onClick={() => handleToggleActive(dest)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition ${
                    dest.isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {dest.isActive ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Paused</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  {/* Test Open URL */}
                  <a
                    href={dest.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Open destination page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(dest)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit destination"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (confirm(`Delete destination "${dest.name}"?`)) {
                        onDeleteDestination(dest.id);
                        onNotify('info', 'Deleted', `Destination "${dest.name}" removed.`);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete destination"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Destination Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingDest ? 'Edit Destination' : 'Add New Destination'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Platform Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PLATFORMS).map(([id, cfg]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFormPlatform(id as PlatformId)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition ${
                        formPlatform === id
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <PlatformIcon platformId={id as PlatformId} size={15} />
                      <span className="truncate">{cfg.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Destination Title / Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Official Community Group"
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Category & Handle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as DestinationCategory)}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="page">Page</option>
                    <option value="group">Group</option>
                    <option value="profile">Profile</option>
                    <option value="channel">Channel</option>
                    <option value="broadcast">Broadcast List</option>
                    <option value="board">Pinterest Board</option>
                    <option value="suite_planner">Meta Suite Planner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Handle / Identifier
                  </label>
                  <input
                    type="text"
                    value={formHandle}
                    onChange={e => setFormHandle(e.target.value)}
                    placeholder="@handle or phone"
                    className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Target URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Target Destination URL
                </label>
                <input
                  type="url"
                  required
                  value={formTargetUrl}
                  onChange={e => setFormTargetUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Notes / Strategy
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Posting guidelines, audience notes, etc."
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
                  {editingDest ? 'Update Destination' : 'Save Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
