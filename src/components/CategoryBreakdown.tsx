import { WatchItem, ContentType } from '../types';
import { CATEGORY_COLORS } from '../data/presets';
import { Film, Images, Video, Radio, Filter } from 'lucide-react';

interface CategoryBreakdownProps {
  items: WatchItem[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

export function CategoryBreakdown({
  items,
  selectedCategory,
  onSelectCategory,
}: CategoryBreakdownProps) {
  const totalItems = items.length;

  // Aggregate categories
  const catCounts: Record<string, number> = {};
  const formatCounts: Record<ContentType, number> = {
    reel: 0,
    carousel: 0,
    video: 0,
    story: 0,
  };

  items.forEach((it) => {
    catCounts[it.category] = (catCounts[it.category] || 0) + 1;
    if (it.contentType in formatCounts) {
      formatCounts[it.contentType] += 1;
    } else {
      formatCounts.reel += 1;
    }
  });

  const sortedCategories = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-slate-850/90 border border-slate-800 rounded-2xl p-5 sm:p-6" id="category-breakdown-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>What Kind of Content You Watched</span>
            {selectedCategory && (
              <span className="text-xs font-normal text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full">
                Filtered: {selectedCategory}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400">
            Categorical taxonomy &amp; media format distribution across {totalItems} items
          </p>
        </div>

        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 self-start sm:self-auto"
          >
            <Filter className="w-3 h-3" />
            <span>Clear Filter</span>
          </button>
        )}
      </div>

      {/* Media Format Distribution Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {[
          { type: 'reel' as ContentType, label: 'Reels (Short)', count: formatCounts.reel, icon: Film, color: 'text-rose-400' },
          { type: 'carousel' as ContentType, label: 'Carousels', count: formatCounts.carousel, icon: Images, color: 'text-blue-400' },
          { type: 'video' as ContentType, label: 'Videos (Long)', count: formatCounts.video, icon: Video, color: 'text-purple-400' },
          { type: 'story' as ContentType, label: 'Stories', count: formatCounts.story, icon: Radio, color: 'text-amber-400' },
        ].map((f) => {
          const Icon = f.icon;
          const pct = totalItems > 0 ? Math.round((f.count / totalItems) * 100) : 0;
          return (
            <div key={f.type} className="bg-slate-800/60 border border-slate-750 rounded-xl p-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-750 flex items-center justify-center shrink-0">
                <Icon className={`w-4 h-4 ${f.color}`} />
              </div>
              <div className="truncate">
                <div className="text-[11px] text-slate-400 truncate">{f.label}</div>
                <div className="text-xs font-bold text-white flex items-baseline gap-1">
                  <span>{f.count}</span>
                  <span className="text-[10px] text-slate-500 font-normal">({pct}%)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Stacked Bar */}
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex mb-4">
        {sortedCategories.map(([cat, count]) => {
          const pct = (count / (totalItems || 1)) * 100;
          const colorMeta = CATEGORY_COLORS[cat] || { accent: '#94a3b8' };
          return (
            <div
              key={cat}
              style={{ width: `${pct}%`, backgroundColor: colorMeta.accent }}
              className="h-full transition-all duration-300 hover:opacity-85 cursor-pointer"
              title={`${cat}: ${count} items (${Math.round(pct)}%)`}
              onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
            />
          );
        })}
      </div>

      {/* Category List with interactive selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {sortedCategories.map(([cat, count]) => {
          const pct = Math.round((count / (totalItems || 1)) * 100);
          const isSelected = selectedCategory === cat;
          const colorMeta = CATEGORY_COLORS[cat] || { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-700', accent: '#64748b' };

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(isSelected ? null : cat)}
              className={`text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                isSelected
                  ? 'bg-rose-500/20 border-rose-500/50 shadow-sm'
                  : 'bg-slate-800/40 border-slate-750 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: colorMeta.accent }}
                />
                <span className="text-xs font-semibold text-slate-200 truncate">{cat}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono">
                <span className="text-white font-bold">{count}</span>
                <span className="text-slate-400 text-[11px]">({pct}%)</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
