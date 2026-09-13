import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { WatchMetricsBar } from './components/WatchMetricsBar';
import { AISummaryCard } from './components/AISummaryCard';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { WatchHistoryFeed } from './components/WatchHistoryFeed';
import { UploadModal } from './components/UploadModal';
import { AddItemModal } from './components/AddItemModal';
import { ShareDigestModal } from './components/ShareDigestModal';
import { PRESET_PROFILES } from './data/presets';
import { WatchItem, PresetProfile, AnalysisSummary } from './types';
import { Sparkles, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [profiles] = useState<PresetProfile[]>(PRESET_PROFILES);
  const [currentProfile, setCurrentProfile] = useState<PresetProfile>(PRESET_PROFILES[0]);
  const [watchItems, setWatchItems] = useState<WatchItem[]>(PRESET_PROFILES[0].items);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Run AI analysis
  const runAnalysis = useCallback(async (items: WatchItem[], style = 'balanced', customFocus?: string) => {
    if (items.length === 0) {
      setSummary(null);
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-watch-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, style, userFocus: customFocus }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: AnalysisSummary = await res.json();
      setSummary(data);
      if (data.isFallback) {
        showToast(data.notice || 'Algorithmic watch digest generated.');
      } else {
        showToast('AI Watch Digest generated successfully!');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      showToast('Generated algorithmic baseline summary.');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    runAnalysis(currentProfile.items);
  }, [currentProfile.id, runAnalysis]);

  // Profile switch
  const handleSelectProfile = (p: PresetProfile) => {
    setCurrentProfile(p);
    setWatchItems(p.items);
    setSelectedCategory(null);
    runAnalysis(p.items);
    showToast(`Switched profile to @${p.handle}`);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    const updated = watchItems.filter((it) => it.id !== id);
    setWatchItems(updated);
    showToast('Removed item from watch log');
    if (updated.length > 0) {
      runAnalysis(updated);
    } else {
      setSummary(null);
    }
  };

  // Clear all
  const handleClearAll = () => {
    setWatchItems([]);
    setSummary(null);
    setSelectedCategory(null);
    showToast('Cleared all watch history items');
  };

  // Add item
  const handleAddItem = (newItem: WatchItem) => {
    const updated = [newItem, ...watchItems];
    setWatchItems(updated);
    showToast(`Logged "${newItem.title.slice(0, 24)}..."`);
    runAnalysis(updated);
  };

  // Import items
  const handleImportItems = (newItems: WatchItem[], sourceName: string) => {
    const updated = [...newItems, ...watchItems];
    setWatchItems(updated);
    showToast(`Imported ${newItems.length} items from ${sourceName}`);
    runAnalysis(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500/30 selection:text-rose-200">
      {/* App Header */}
      <Header
        currentProfile={currentProfile}
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAdd={() => setIsAddOpen(true)}
        onReanalyze={() => runAnalysis(watchItems)}
        isAnalyzing={isAnalyzing}
        totalItems={watchItems.length}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Profile Context Bar */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${currentProfile.avatarBg} flex items-center justify-center font-bold text-white text-xs shrink-0 shadow`}>
              {currentProfile.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>{currentProfile.name}</span>
                <span className="text-slate-400 font-normal">(@{currentProfile.handle})</span>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 text-[10px] font-semibold">
                  {currentProfile.badge}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {currentProfile.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium underline underline-offset-4"
            >
              Analyze Your Own Instagram Export
            </button>
          </div>
        </div>

        {/* Top Key Metrics Row */}
        <WatchMetricsBar items={watchItems} summary={summary} />

        {/* Primary AI Watch Summary Card */}
        <AISummaryCard
          summary={summary}
          isAnalyzing={isAnalyzing}
          onReanalyze={(style, focus) => runAnalysis(watchItems, style, focus)}
          onOpenShareModal={() => setIsShareOpen(true)}
        />

        {/* Visual Category & Format Breakdown */}
        <CategoryBreakdown
          items={watchItems}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Detailed Watch Feed & Log */}
        <WatchHistoryFeed
          items={watchItems}
          selectedCategory={selectedCategory}
          onDeleteItem={handleDeleteItem}
          onClearAll={handleClearAll}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-400">ReelSense</span> — Instagram Watch History &amp; Algorithmic Digest
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini 3.8-Flash</span>
            <span>•</span>
            <span>Local &amp; Secure</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImportItems={handleImportItems}
      />

      <AddItemModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddItem={handleAddItem}
      />

      <ShareDigestModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        summary={summary}
        profile={currentProfile}
        items={watchItems}
      />
    </div>
  );
}
