import { Flame, Upload, Plus, Sparkles, Instagram, RefreshCw, ChevronDown } from 'lucide-react';
import { PresetProfile } from '../types';

interface HeaderProps {
  currentProfile: PresetProfile;
  profiles: PresetProfile[];
  onSelectProfile: (profile: PresetProfile) => void;
  onOpenUpload: () => void;
  onOpenAdd: () => void;
  onReanalyze: () => void;
  isAnalyzing: boolean;
  totalItems: number;
}

export function Header({
  currentProfile,
  profiles,
  onSelectProfile,
  onOpenUpload,
  onOpenAdd,
  onReanalyze,
  isAnalyzing,
  totalItems,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Instagram className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                ReelSense
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                Watch Digest
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Instagram Content &amp; Viewing Summary
            </p>
          </div>
        </div>

        {/* Profile Preset Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative group">
            <div className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 rounded-lg px-3 py-1.5 cursor-pointer transition text-sm">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${currentProfile.avatarBg} flex items-center justify-center text-[11px] font-bold text-white shadow`}>
                {currentProfile.name.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <div className="font-medium text-xs text-slate-200 flex items-center gap-1.5">
                  @{currentProfile.handle}
                  <span className="text-[10px] text-slate-400 font-normal">({currentProfile.badge})</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-72 bg-slate-850 border border-slate-700/90 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50 animate-in fade-in-50 duration-150">
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-750 mb-1">
                Explore Sample Profiles
              </div>
              <div className="space-y-1">
                {profiles.map((p) => {
                  const isSelected = p.id === currentProfile.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectProfile(p)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition text-xs ${
                        isSelected
                          ? 'bg-rose-500/15 text-rose-200 border border-rose-500/30 font-medium'
                          : 'hover:bg-slate-750 text-slate-300'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${p.avatarBg} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                        {p.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-200">@{p.handle}</div>
                        <div className="text-[11px] text-slate-400 truncate">{p.badge} ({p.items.length} items)</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={onOpenUpload}
            id="btn-upload-export"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            title="Import official Instagram JSON export or paste links"
          >
            <Upload className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Import Data</span>
          </button>

          <button
            onClick={onOpenAdd}
            id="btn-add-item"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            title="Add watched Reel or post"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Log Reel</span>
          </button>

          <button
            onClick={onReanalyze}
            disabled={isAnalyzing}
            id="btn-reanalyze"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 rounded-lg shadow-md shadow-rose-900/30 transition disabled:opacity-50"
            title="Generate fresh AI summary with Gemini"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            )}
            <span>{isAnalyzing ? 'Summarizing...' : 'AI Digest'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
