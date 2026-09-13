import { useState } from 'react';
import { X, Copy, Check, Instagram, Sparkles, Download, Quote } from 'lucide-react';
import { AnalysisSummary, PresetProfile, WatchItem } from '../types';

interface ShareDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: AnalysisSummary | null;
  profile: PresetProfile;
  items: WatchItem[];
}

export function ShareDigestModal({
  isOpen,
  onClose,
  summary,
  profile,
  items,
}: ShareDigestModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !summary) return null;

  const totalMinutes = Math.round(
    items.reduce((acc, curr) => acc + (curr.durationSeconds || 30), 0) / 60
  );

  const formattedShareText = `📱 My Instagram Watch Digest & Algorithm Archetype

✨ Archetype: ${summary.overviewTitle}
💬 "${summary.quote || 'Curated media diet'}"

📊 Top Watch Niches:
${summary.topCategories.map((c) => `• ${c.category}: ${c.percentage}% (${c.keyThemes.slice(0, 2).join(', ')})`).join('\n')}

⏱️ Stats:
• Watched: ${items.length} Reels & Posts (~${totalMinutes} mins)
• Peak Hours: ${summary.viewingPatterns.peakHoursLabel}
• Signal vs Dopamine: ${summary.viewingPatterns.educationalScore}/100 Educational Score
• Doomscroll Risk: ${summary.viewingPatterns.doomscrollRisk}

💡 Key Takeaway:
"${summary.keyTakeaways[0]?.insight || 'High-signal media curation over mindless scrolling.'}"

Generated via ReelSense AI`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(formattedShareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ profile, summary, items }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `instagram-watch-digest-${profile.handle}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in-50 duration-150">
      <div className="bg-slate-850 border border-slate-750 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Instagram className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Share Watch Digest
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Card Preview */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col items-center">
          <div
            id="shareable-story-card"
            className="w-full rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-rose-500/40 p-5 shadow-2xl relative overflow-hidden"
          >
            {/* Background Glows */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-500/15 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/15 rounded-full blur-2xl pointer-events-none"></div>

            {/* Top Bar: Profile */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${profile.avatarBg} flex items-center justify-center text-sm font-black text-white shadow-md`}>
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-xs text-white flex items-center gap-1">
                    @{profile.handle}
                  </div>
                  <div className="text-[10px] text-slate-400">{profile.badge}</div>
                </div>
              </div>

              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow">
                <Instagram className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Archetype Badge */}
            <div className="mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Algorithm Archetype
              </span>
              <h3 className="text-lg font-black text-white mt-1 leading-tight">
                {summary.overviewTitle}
              </h3>
            </div>

            {/* Quote */}
            {summary.quote && (
              <div className="p-2.5 bg-slate-800/60 border border-slate-750/80 rounded-xl mb-3 text-[11px] text-slate-300 italic flex items-start gap-1.5">
                <Quote className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                <span>&ldquo;{summary.quote}&rdquo;</span>
              </div>
            )}

            {/* Top Categories */}
            <div className="space-y-1.5 mb-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                What I Watch On Instagram:
              </div>
              <div className="space-y-1">
                {summary.topCategories.slice(0, 3).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-750">
                    <span className="font-medium text-slate-200">{cat.category}</span>
                    <span className="font-bold text-rose-400 font-mono">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
              <div className="bg-slate-800/40 p-1.5 rounded-lg">
                <div className="text-[9px] text-slate-400 uppercase">Watched</div>
                <div className="text-xs font-bold text-white">{items.length}</div>
              </div>
              <div className="bg-slate-800/40 p-1.5 rounded-lg">
                <div className="text-[9px] text-slate-400 uppercase">Time</div>
                <div className="text-xs font-bold text-white">{totalMinutes}m</div>
              </div>
              <div className="bg-slate-800/40 p-1.5 rounded-lg">
                <div className="text-[9px] text-slate-400 uppercase">Signal</div>
                <div className="text-xs font-bold text-emerald-400">{summary.viewingPatterns.educationalScore}%</div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-3 text-center text-[10px] text-slate-500 font-mono">
              ReelSense • Powered by Gemini AI
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 w-full mt-4">
            <button
              onClick={handleCopyText}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-md shadow-rose-900/30"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary Text'}</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              title="Download full JSON dataset"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
