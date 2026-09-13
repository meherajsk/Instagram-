import { Clock, Eye, Film, Sparkles, Bookmark, Heart, Zap } from 'lucide-react';
import { WatchItem, AnalysisSummary } from '../types';

interface WatchMetricsBarProps {
  items: WatchItem[];
  summary: AnalysisSummary | null;
}

export function WatchMetricsBar({ items, summary }: WatchMetricsBarProps) {
  const totalItems = items.length;
  const totalSeconds = items.reduce((acc, curr) => acc + (curr.durationSeconds || 30), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  // Category counts
  const catCounts: Record<string, number> = {};
  items.forEach((it) => {
    catCounts[it.category] = (catCounts[it.category] || 0) + 1;
  });
  const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const dominantCategory = sortedCats[0]?.[0] || 'Mixed';
  const dominantPercent = totalItems > 0 ? Math.round(((sortedCats[0]?.[1] || 0) / totalItems) * 100) : 0;

  // Engaged counts
  const savedCount = items.filter((it) => it.engagement === 'saved').length;
  const likedCount = items.filter((it) => it.engagement === 'liked').length;
  const avgCompletion = totalItems > 0
    ? Math.round(items.reduce((acc, curr) => acc + (curr.completionRate || 100), 0) / totalItems)
    : 100;

  const eduScore = summary?.viewingPatterns?.educationalScore ?? 75;
  const dopamineScore = summary?.viewingPatterns?.dopamineScore ?? 65;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3" id="watch-metrics-bar">
      {/* Metric 1: Total Watched */}
      <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Watched Media</span>
          <Film className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{totalItems}</span>
          <span className="text-xs text-slate-400">Reels &amp; posts</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>{avgCompletion}% avg completion</span>
        </div>
      </div>

      {/* Metric 2: Estimated Time */}
      <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Estimated Time</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{totalMinutes}</span>
          <span className="text-xs text-slate-400">minutes total</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
          <span>~{Math.round(totalSeconds / (totalItems || 1))}s per reel</span>
        </div>
      </div>

      {/* Metric 3: Dominant Category */}
      <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Dominant Focus</span>
          <Zap className="w-4 h-4 text-purple-400" />
        </div>
        <div className="truncate">
          <span className="text-lg font-bold text-white block truncate">{dominantCategory}</span>
          <span className="text-xs text-purple-300 font-medium">{dominantPercent}% of watch log</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 truncate">
          {sortedCats.length} distinct categories
        </div>
      </div>

      {/* Metric 4: Signal vs Dopamine Ratio */}
      <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Signal vs Dopamine</span>
          <Sparkles className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-left">
            <span className="text-xl font-bold text-blue-400">{eduScore}</span>
            <span className="text-[10px] text-slate-400 block uppercase">Learning</span>
          </div>
          <span className="text-xs text-slate-500 font-bold">vs</span>
          <div className="text-right">
            <span className="text-xl font-bold text-pink-400">{dopamineScore}</span>
            <span className="text-[10px] text-slate-400 block uppercase">Entertainment</span>
          </div>
        </div>
        {/* Dual Progress Bar */}
        <div className="mt-2 w-full h-1.5 bg-slate-700 rounded-full overflow-hidden flex">
          <div className="bg-blue-500 h-full" style={{ width: `${(eduScore / (eduScore + dopamineScore || 1)) * 100}%` }}></div>
          <div className="bg-pink-500 h-full" style={{ width: `${(dopamineScore / (eduScore + dopamineScore || 1)) * 100}%` }}></div>
        </div>
      </div>

      {/* Metric 5: High Intent Engagement */}
      <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition col-span-2 md:col-span-4 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">High Intent</span>
          <Bookmark className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-200">
            <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span className="text-lg font-bold">{savedCount}</span>
            <span className="text-[11px] text-slate-400">saved</span>
          </div>
          <div className="flex items-center gap-1 text-slate-200">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
            <span className="text-lg font-bold">{likedCount}</span>
            <span className="text-[11px] text-slate-400">liked</span>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          Saved = strongest algorithm signal
        </div>
      </div>
    </div>
  );
}
