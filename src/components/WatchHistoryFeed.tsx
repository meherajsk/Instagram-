import { useState } from 'react';
import { Search, Film, Images, Video, Radio, Bookmark, Heart, Share2, Trash2, Tag, Clock, ArrowUpDown } from 'lucide-react';
import { WatchItem, ContentType } from '../types';
import { CATEGORY_COLORS } from '../data/presets';

interface WatchHistoryFeedProps {
  items: WatchItem[];
  selectedCategory: string | null;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export function WatchHistoryFeed({
  items,
  selectedCategory,
  onDeleteItem,
  onClearAll,
}: WatchHistoryFeedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [engagementFilter, setEngagementFilter] = useState<'all' | 'saved' | 'liked' | 'watched'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'duration' | 'completion'>('recent');

  // Filter items
  const filtered = items.filter((item) => {
    if (selectedCategory && item.category !== selectedCategory) {
      return false;
    }
    if (engagementFilter !== 'all' && item.engagement !== engagementFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCreator = item.creator.toLowerCase().includes(q) || item.handle.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchCreator && !matchCategory && !matchTags) {
        return false;
      }
    }
    return true;
  });

  // Sort items
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'duration') {
      return (b.durationSeconds || 0) - (a.durationSeconds || 0);
    }
    if (sortBy === 'completion') {
      return (b.completionRate || 0) - (a.completionRate || 0);
    }
    // Default: recent
    return new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime();
  });

  const getFormatIcon = (type: ContentType) => {
    switch (type) {
      case 'carousel':
        return <Images className="w-3.5 h-3.5 text-blue-400" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-purple-400" />;
      case 'story':
        return <Radio className="w-3.5 h-3.5 text-amber-400" />;
      case 'reel':
      default:
        return <Film className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div className="bg-slate-850/90 border border-slate-800 rounded-2xl p-5 sm:p-6" id="watch-history-feed">
      {/* Top Controls: Search, Filters, Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Watch History Log</span>
            <span className="text-xs font-mono font-normal text-slate-400">
              ({sorted.length} of {items.length} items)
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Chronological audit of media consumed on Instagram
          </p>
        </div>

        {/* Search Bar & Quick Clear */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reels, creator, tags..."
              className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {items.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all items from this watch history?')) {
                  onClearAll();
                }
              }}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-slate-750 transition"
              title="Clear watch list"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Engagement Chips & Sort By */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 font-medium text-[11px] mr-1">Filter:</span>
          {(['all', 'saved', 'liked', 'watched'] as const).map((eng) => (
            <button
              key={eng}
              onClick={() => setEngagementFilter(eng)}
              className={`px-2.5 py-1 rounded-lg capitalize transition text-xs ${
                engagementFilter === eng
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700/60'
              }`}
            >
              {eng}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="recent">Most Recent</option>
            <option value="duration">Longest Duration</option>
            <option value="completion">Completion %</option>
          </select>
        </div>
      </div>

      {/* Items List */}
      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <Film className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-slate-300">No watched content found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or import your Instagram data export.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80 mt-2">
          {sorted.map((item) => {
            const colorMeta = CATEGORY_COLORS[item.category] || { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-700', accent: '#64748b' };
            const formattedDate = new Date(item.watchedAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="py-3.5 px-2 hover:bg-slate-800/40 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Format icon avatar */}
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    {getFormatIcon(item.contentType)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-xs text-rose-300">
                        @{item.handle || 'creator'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal truncate">
                        • {item.creator}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${colorMeta.bg} ${colorMeta.text} ${colorMeta.border}`}
                      >
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formattedDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-medium text-slate-100 leading-snug break-words">
                      {item.title}
                    </h4>

                    {item.notes && (
                      <p className="text-xs text-slate-400 mt-1 italic line-clamp-2">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.tags.map((t, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-750 flex items-center gap-0.5"
                          >
                            <Tag className="w-2.5 h-2.5 opacity-60" />
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right metrics & action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  {/* Engagement indicator */}
                  <div className="flex items-center gap-1.5">
                    {item.engagement === 'saved' && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                        <Bookmark className="w-3 h-3 fill-amber-400" />
                        Saved
                      </span>
                    )}
                    {item.engagement === 'liked' && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-md border border-rose-400/20">
                        <Heart className="w-3 h-3 fill-rose-400" />
                        Liked
                      </span>
                    )}
                    {item.engagement === 'shared' && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md border border-purple-400/20">
                        <Share2 className="w-3 h-3" />
                        Shared
                      </span>
                    )}
                    {item.engagement === 'watched' && (
                      <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-750">
                        Watched
                      </span>
                    )}
                  </div>

                  {/* Duration & completion */}
                  <div className="text-right font-mono text-xs">
                    <div className="text-slate-200 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.durationSeconds}s
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      {item.completionRate}% view
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Remove item from watch history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
