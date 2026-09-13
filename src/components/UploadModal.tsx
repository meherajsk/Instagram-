import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { X, Upload, FileJson, Sparkles, Clipboard, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { parseInstagramExportJson } from '../utils/instagramParser';
import { WatchItem } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportItems: (newItems: WatchItem[], sourceName: string) => void;
}

export function UploadModal({ isOpen, onClose, onImportItems }: UploadModalProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'paste' | 'guide'>('file');
  const [pasteText, setPasteText] = useState('');
  const [isParsingText, setIsParsingText] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setErrorMessage(null);
    if (!file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
      setErrorMessage('Please provide a .json Instagram export file (e.g. videos_watched.json, recently_viewed.json, your_topics.json).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const items = parseInstagramExportJson(text, file.name.toLowerCase());
        if (items.length === 0) {
          setErrorMessage('No watch items found in this file. Please verify it is an Instagram export JSON file.');
          return;
        }
        onImportItems(items, file.name);
        onClose();
      } catch (err: any) {
        setErrorMessage(`Failed to parse file: ${err.message || 'Invalid format'}`);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Error reading the file.');
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) return;
    setIsParsingText(true);
    setErrorMessage(null);

    try {
      // First check if it's raw JSON
      if (pasteText.trim().startsWith('{') || pasteText.trim().startsWith('[')) {
        try {
          const items = parseInstagramExportJson(pasteText.trim(), 'pasted.json');
          if (items.length > 0) {
            onImportItems(items, 'Pasted JSON');
            onClose();
            return;
          }
        } catch {
          // fallback to AI parser
        }
      }

      // Call backend AI parser to convert freeform notes/links into structured watch items
      const res = await fetch('/api/parse-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: pasteText }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        onImportItems(data.items, 'Pasted Reels Log');
        onClose();
      } else {
        setErrorMessage('Could not extract watch items from the provided text.');
      }
    } catch (err: any) {
      setErrorMessage(`Error parsing content: ${err.message}`);
    } finally {
      setIsParsingText(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50 duration-150">
      <div className="bg-slate-850 border border-slate-750 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Instagram Watch Data</h3>
              <p className="text-xs text-slate-400">Analyze real watch history or pasted Reels links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/30 text-xs">
          <button
            onClick={() => setActiveTab('file')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'file'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Upload JSON Export</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste Links / Notes</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Download from IG</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                  dragOver
                    ? 'border-rose-500 bg-rose-500/10'
                    : 'border-slate-750 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/70'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,.txt"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
                  <FileJson className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white mb-1">
                  Drop your Instagram JSON file here
                </p>
                <p className="text-xs text-slate-400 max-w-sm mb-3">
                  Supports <code className="text-rose-300">videos_watched.json</code>, <code className="text-rose-300">recently_viewed.json</code>, <code className="text-rose-300">your_topics.json</code>, or <code className="text-rose-300">saved_posts.json</code>
                </p>
                <span className="px-3 py-1 bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs font-semibold rounded-lg">
                  Browse Files
                </span>
              </div>

              <div className="p-3.5 bg-slate-800/60 border border-slate-750 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">100% Private &amp; Client-Side Parsed</span>
                  <span className="text-slate-400">
                    Your personal files never leave your browser for storage. Only aggregated watch log text is sent to Gemini for your AI summary.
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Paste Reel links, creator handles, or freeform watch notes:
                </label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={6}
                  placeholder={`E.g.:
1. Watched @hubermanlab video about cold exposure dopamine spikes
2. https://www.instagram.com/reel/C2... by @theprimeagen about linux setups
3. Video on S&P 500 compounding by @benfelix
4. Meal prep chicken bowl reel by @zachcoen`}
                  className="w-full bg-slate-850 border border-slate-750 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <button
                onClick={handlePasteSubmit}
                disabled={isParsingText || !pasteText.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isParsingText ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                    <span>AI Structuring &amp; Categorizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Parse with Gemini AI</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3.5 text-xs text-slate-300">
              <h4 className="font-bold text-white text-sm">
                How to download your official watch history from Instagram:
              </h4>

              <div className="space-y-2.5">
                {[
                  {
                    step: '1',
                    title: 'Open Accounts Center',
                    desc: 'In Instagram, go to your Profile -> Menu (3 lines) -> Settings & privacy -> Accounts Center.',
                  },
                  {
                    step: '2',
                    title: 'Choose "Your information and permissions"',
                    desc: 'Select "Download your information" -> "Download or transfer information".',
                  },
                  {
                    step: '3',
                    title: 'Select Activity & JSON format',
                    desc: 'Choose "Some of your information" -> Select "Your Instagram activity" (including Content viewed & Topics).',
                  },
                  {
                    step: '4',
                    title: 'Format: JSON',
                    desc: 'Crucial: Under Format, choose JSON (NOT HTML). Set date range to "All time" or "Past month".',
                  },
                  {
                    step: '5',
                    title: 'Download & Upload',
                    desc: 'Instagram will email you a ZIP file within minutes. Open the ZIP and drop "your_topics.json" or "videos_watched.json" into this app!',
                  },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3 p-2.5 bg-slate-800/50 rounded-xl border border-slate-750">
                    <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <div>
                      <span className="font-semibold text-white block">{s.title}</span>
                      <span className="text-slate-400">{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
