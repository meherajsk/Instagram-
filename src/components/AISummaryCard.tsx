import { useState } from 'react';
import { Sparkles, Brain, Lightbulb, Compass, ShieldAlert, RefreshCw, Share2, Quote, CheckCircle2, ChevronRight, SlidersHorizontal, Flame } from 'lucide-react';
import { AnalysisSummary } from '../types';

interface AISummaryCardProps {
  summary: AnalysisSummary | null;
  isAnalyzing: boolean;
  onReanalyze: (style: string, customFocus?: string) => void;
  onOpenShareModal: () => void;
}

export function AISummaryCard({
  summary,
  isAnalyzing,
  onReanalyze,
  onOpenShareModal,
}: AISummaryCardProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'takeaways' | 'patterns' | 'diet'>('summary');
  const [selectedStyle, setSelectedStyle] = useState<string>('balanced');
  const [customFocus, setCustomFocus] = useState<string>('');
  const [isFocusOpen, setIsFocusOpen] = useState<boolean>(false);

  if (!summary && isAnalyzing) {
    return (
      <div className="bg-gradient-to-b from-slate-850 to-slate-900 border border-slate-750 rounded-2xl p-8 text-center" id="ai-summary-loading">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Sparkles className="w-7 h-7 text-rose-400 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Analyzing Your Instagram Watch Log...</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Gemini 3.8 is decoding your Reels, topics, creator habits, and algorithmic hooks to deliver your comprehensive watch digest.
        </p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-slate-850 via-slate-850 to-slate-900 border border-slate-750/90 rounded-2xl shadow-xl overflow-hidden" id="ai-summary-card">
      {/* Top Banner: Archetype & Quote */}
      <div className="p-6 sm:p-7 border-b border-slate-800 bg-gradient-to-r from-slate-850 via-slate-800/60 to-purple-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-sm shadow-rose-900/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Algorithmic Archetype
              </span>
              {summary.isFallback && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Algorithmic Baseline
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">
                Updated {new Date(summary.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {summary.overviewTitle}
            </h2>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              {summary.archetypeDescription}
            </p>
          </div>

          {/* Share & Customize Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={onOpenShareModal}
              id="btn-share-card"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition shadow-sm"
              title="Preview shareable Story / Card digest"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Share Card</span>
            </button>

            <button
              onClick={() => setIsFocusOpen(!isFocusOpen)}
              id="btn-toggle-focus"
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition shadow-sm ${
                isFocusOpen
                  ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
              }`}
              title="Customize analysis tone or focus"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
              <span>Fine-Tune</span>
            </button>
          </div>
        </div>

        {/* High demand or Fallback Notice */}
        {summary.notice && (
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{summary.notice}</span>
            </div>
            <button
              onClick={() => onReanalyze(selectedStyle, customFocus)}
              disabled={isAnalyzing}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg font-semibold flex items-center gap-1 shrink-0 transition"
            >
              <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>Retry Gemini</span>
            </button>
          </div>
        )}

        {/* Catchy Quote */}
        {summary.quote && (
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-start gap-2.5 text-slate-300 text-xs italic">
            <Quote className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>&ldquo;{summary.quote}&rdquo;</span>
          </div>
        )}

        {/* Expandable Fine-tune & Reanalyze Box */}
        {isFocusOpen && (
          <div className="mt-4 p-4 bg-slate-900/90 border border-slate-750 rounded-xl animate-in fade-in-50 duration-150">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Refine Analysis Perspective</span>
              <span className="text-[11px] text-slate-400 font-normal">Powered by Gemini 3.8-Flash</span>
            </div>

            {/* Style Pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { id: 'balanced', label: 'Balanced & Perceptive' },
                { id: 'witty-roast', label: 'Witty Roast (Friendly)' },
                { id: 'learning-focus', label: 'Actionable Wisdom & Notes' },
                { id: 'dopamine-audit', label: 'Attention Span & Dopamine Audit' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`px-3 py-1 text-xs rounded-lg transition font-medium ${
                    selectedStyle === style.id
                      ? 'bg-rose-500 text-white font-semibold shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>

            {/* Custom Focus Input */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customFocus}
                onChange={(e) => setCustomFocus(e.target.value)}
                placeholder="E.g. What specific fitness advice was recommended? Or: how can I stop doomscrolling?"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={() => onReanalyze(selectedStyle, customFocus)}
                disabled={isAnalyzing}
                className="px-4 py-1.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Regenerate Summary</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 px-6 border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
        {[
          { id: 'summary', label: 'Executive Summary', icon: Brain },
          { id: 'takeaways', label: 'What You Learned', icon: Lightbulb, badge: summary.keyTakeaways?.length },
          { id: 'patterns', label: 'Attention & Patterns', icon: Compass },
          { id: 'diet', label: 'Algorithm Tune-Up', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              id={`tab-${tab.id}`}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-rose-500 text-rose-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panes */}
      <div className="p-6 sm:p-7">
        {/* 1. Executive Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-rose-400" />
                Comprehensive Watch Digest &amp; Subconscious Interests
              </h3>
              <div className="text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-normal">
                {summary.executiveSummary}
              </div>
            </div>

            {/* Top Categories Grid */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Detected Content Niches &amp; Micro-Themes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {summary.topCategories.map((cat, idx) => (
                  <div
                    key={cat.category || idx}
                    className="bg-slate-800/70 border border-slate-750 rounded-xl p-3.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">{cat.category}</span>
                      <span className="px-2 py-0.5 text-xs font-bold bg-rose-500/20 text-rose-300 rounded-full">
                        {cat.percentage}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(cat.keyThemes || []).map((th, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[11px] bg-slate-750 text-slate-300 rounded-md border border-slate-700/60"
                        >
                          #{th}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. What You Learned / Key Takeaways */}
        {activeTab === 'takeaways' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400">
                Actionable knowledge, frameworks, and insights extracted from your watched Reels and videos:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {summary.keyTakeaways.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/80 border border-slate-750 rounded-xl p-4 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                        {item.topic}
                      </span>
                      <span className="text-[11px] text-slate-400 italic">
                        via {item.creatorOrSource}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      {item.insight}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-750/70 flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Absorbed into mental model</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Viewing Patterns & Attention Audit */}
        {activeTab === 'patterns' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/70 border border-slate-750 rounded-xl p-4">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 block mb-1">
                  Peak Consumption Window
                </span>
                <span className="text-base font-bold text-white block">
                  {summary.viewingPatterns.peakHoursLabel}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  When you are most vulnerable to the infinite feed
                </span>
              </div>

              <div className="bg-slate-800/70 border border-slate-750 rounded-xl p-4">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 block mb-1">
                  Doomscroll Vulnerability
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-bold ${
                      summary.viewingPatterns.doomscrollRisk === 'High'
                        ? 'text-red-400'
                        : summary.viewingPatterns.doomscrollRisk === 'Moderate'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {summary.viewingPatterns.doomscrollRisk} Risk
                  </span>
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  Based on late-night sessions and short-clip clustering
                </span>
              </div>

              <div className="bg-slate-800/70 border border-slate-750 rounded-xl p-4">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 block mb-1">
                  Daily Habit Estimate
                </span>
                <span className="text-lg font-bold text-white block">
                  ~{summary.viewingPatterns.estimatedDailyMinutes} mins/day
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Equivalent to ~{Math.round((summary.viewingPatterns.estimatedDailyMinutes * 365) / 60)} hours per year
                </span>
              </div>
            </div>

            {/* Detected Rabbit Holes */}
            <div className="p-4 bg-slate-800/50 border border-slate-750 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-400" />
                Subconscious Rabbit Holes
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                Topics that pulled you into multiple consecutive video loops without intentional search:
              </p>
              <div className="flex flex-wrap gap-2">
                {summary.viewingPatterns.rabbitHoles.map((hole, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-purple-400" />
                    {hole}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Algorithm Diet & Reset Advice */}
        {activeTab === 'diet' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 border border-slate-750 rounded-xl">
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                How to Re-Program Your Instagram Explore &amp; Reels Algorithm
              </h4>
              <p className="text-xs text-slate-400">
                The Instagram algorithm updates its model weights in real-time based on your watch duration, saves, and skips. Here is your personalized prescription:
              </p>
            </div>

            <div className="space-y-3">
              {summary.algorithmDietAdvice.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/70 border border-slate-750 rounded-xl p-4 flex items-start gap-3.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
                      {item.action}
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed font-normal">
                      {item.tip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
