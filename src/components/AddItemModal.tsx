import { useState, FormEvent } from 'react';
import { X, Plus, Film, Clock } from 'lucide-react';
import { WatchItem, ContentType, EngagementType } from '../types';
import { CATEGORY_COLORS } from '../data/presets';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: WatchItem) => void;
}

export function AddItemModal({ isOpen, onClose, onAddItem }: AddItemModalProps) {
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [handle, setHandle] = useState('');
  const [category, setCategory] = useState('Tech & AI');
  const [contentType, setContentType] = useState<ContentType>('reel');
  const [durationSeconds, setDurationSeconds] = useState(45);
  const [engagement, setEngagement] = useState<EngagementType>('watched');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(Boolean);

    const newItem: WatchItem = {
      id: `manual-${Date.now()}`,
      title: title.trim(),
      creator: creator.trim() || handle.trim() || 'Instagram Creator',
      handle: handle.trim().replace(/^@/, '') || 'creator',
      contentType,
      category,
      durationSeconds: Number(durationSeconds) || 30,
      watchedAt: new Date().toISOString(),
      completionRate: 100,
      engagement,
      tags: tags.length > 0 ? tags : ['instagram', category.toLowerCase().replace(/\s+/g, '-')],
      notes: notes.trim() || undefined,
    };

    onAddItem(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50 duration-150">
      <div className="bg-slate-850 border border-slate-750 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Log Watched Media</h3>
              <p className="text-xs text-slate-400">Add a Reel or post to your watch history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Title / Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Title or Content Description *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5-minute morning mobility routine for tight hips"
              className="w-full bg-slate-800 border border-slate-750 rounded-xl px-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 text-xs"
            />
          </div>

          {/* Creator & Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Creator Handle (@username)
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. hubermanlab"
                className="w-full bg-slate-800 border border-slate-750 rounded-xl px-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Creator Name (Optional)
              </label>
              <input
                type="text"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="e.g. Dr. Andrew Huberman"
                className="w-full bg-slate-800 border border-slate-750 rounded-xl px-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 text-xs"
              />
            </div>
          </div>

          {/* Category & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-750 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 text-xs"
              >
                {Object.keys(CATEGORY_COLORS).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Format
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full bg-slate-800 border border-slate-750 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 text-xs"
              >
                <option value="reel">Reel (Short Video)</option>
                <option value="carousel">Carousel (Swipeable)</option>
                <option value="video">Long-Form Video</option>
                <option value="story">Story</option>
              </select>
            </div>
          </div>

          {/* Duration & Engagement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Duration (Seconds)</span>
                <span className="text-slate-400 font-mono">{durationSeconds}s</span>
              </label>
              <input
                type="number"
                min="5"
                max="600"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-750 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Engagement Action
              </label>
              <select
                value={engagement}
                onChange={(e) => setEngagement(e.target.value as EngagementType)}
                className="w-full bg-slate-800 border border-slate-750 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 text-xs"
              >
                <option value="watched">Watched Only</option>
                <option value="saved">Saved (High Intent)</option>
                <option value="liked">Liked</option>
                <option value="shared">Shared</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. mobility, stretching, morning"
              className="w-full bg-slate-800 border border-slate-750 rounded-xl px-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 text-xs"
            />
          </div>

          {/* Notes or Key Takeaway */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Notes / Takeaway from this Reel
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Recommended doing 90-90 hip stretch for 2 minutes before squatting."
              className="w-full bg-slate-800 border border-slate-750 rounded-xl p-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 text-xs"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition shadow-md shadow-emerald-900/30"
            >
              Add to Watch Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
