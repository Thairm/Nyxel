import { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown, Settings2, Zap } from 'lucide-react';
import type { Model } from '@/data/modelData';

interface PromptBarProps {
  prompt: string;
  setPrompt: (v: string) => void;
  negativePrompt: string;
  setNegativePrompt: (v: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  costLabel: string;
  selectedRatio: string;
  onRatioChange: (r: string) => void;
  selectedModel: Model;
  onModelChange: (m: Model) => void;
  availableModels: Model[];
  canUseFreeCreation?: boolean;
  freeCreationActive?: boolean;
  onFreeCreationToggle?: () => void;
}

// All SDXL aspect ratios (Illustrious models support all except 21:9)
const ASPECT_RATIOS = [
  { label: '1:1', value: '1:1', pixels: '1024 × 1024' },
  { label: '2:3', value: '2:3', pixels: '832 × 1216' },
  { label: '3:2', value: '3:2', pixels: '1216 × 832' },
  { label: '3:4', value: '3:4', pixels: '896 × 1152' },
  { label: '4:3', value: '4:3', pixels: '1152 × 896' },
  { label: '4:5', value: '4:5', pixels: '1024 × 1280' },
  { label: '5:4', value: '5:4', pixels: '1280 × 1024' },
  { label: '9:16', value: '9:16', pixels: '768 × 1344' },
  { label: '16:9', value: '16:9', pixels: '1344 × 768' },
];

type PromptTab = 'positive' | 'negative';

export function PromptBar({
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  onGenerate,
  isGenerating,
  costLabel,
  selectedRatio,
  onRatioChange,
  selectedModel,
  onModelChange,
  availableModels,
  canUseFreeCreation = false,
  freeCreationActive = false,
  onFreeCreationToggle,
}: PromptBarProps) {
  const [activeTab, setActiveTab] = useState<PromptTab>('positive');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>, setter: (v: string) => void) => {
    setter(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onGenerate();
    }
  };

  const hasNegativePrompt = negativePrompt.trim().length > 0;

  return (
    <div className="bg-[#0D0F0E] px-3 sm:px-6 py-3">
      <div className="max-w-4xl mx-auto">

        {/* ══════════════════════════════════════════════
            PROMPT BOX (tabs are part of the box border)
            ══════════════════════════════════════════════ */}
        <div className="relative bg-[#141816] border border-white/10 rounded-2xl overflow-visible focus-within:border-purple-500/40 transition-colors">

          {/* ── Tab row: sits at the very top of the box ── */}
          <div className="flex items-center justify-between px-3 pt-2.5 pb-0">
            {/* Left: Prompt / Negative tab pills */}
            <div className="flex items-center -mb-px">
              <button
                onClick={() => setActiveTab('positive')}
                className={`text-xs font-medium px-3 py-1.5 rounded-t-lg border-b-2 transition-all ${
                  activeTab === 'positive'
                    ? 'text-white border-purple-400 bg-white/5'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                + Prompt
              </button>
              <button
                onClick={() => setActiveTab('negative')}
                className={`text-xs font-medium px-3 py-1.5 rounded-t-lg border-b-2 transition-all relative ${
                  activeTab === 'negative'
                    ? 'text-white border-purple-400 bg-white/5'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                − Negative
                {hasNegativePrompt && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 absolute -top-0.5 -right-0.5" />
                )}
              </button>
            </div>

            {/* Right: Model selector + Settings button */}
            <div className="flex items-center gap-1.5">
              {/* Model dropdown */}
              <div className="relative" ref={modelDropdownRef}>
                <button
                  onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="max-w-[80px] sm:max-w-none truncate">{selectedModel.name}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {modelDropdownOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-52 bg-[#1a1d1b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-1">
                      {availableModels.map(model => (
                        <button
                          key={model.id}
                          onClick={() => { onModelChange(model); setModelDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            selectedModel.id === model.id
                              ? 'bg-purple-500/20 text-white'
                              : 'text-gray-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <img src={model.image} alt={model.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate">{model.name}</div>
                            {model.badge && <div className="text-[10px] text-purple-400">{model.badge}</div>}
                          </div>
                          {selectedModel.id === model.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="px-3 py-2 border-t border-white/5 text-[10px] text-gray-600 text-center">
                      More models coming soon
                    </div>
                  </div>
                )}
              </div>

              {/* Settings button (opens aspect ratio popup) */}
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                    settingsOpen
                      ? 'bg-white/10 text-white border-white/20'
                      : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>

                {settingsOpen && (
                  <div className="absolute bottom-full right-0 mb-2 bg-[#1a1d1b] border border-white/10 rounded-xl shadow-2xl p-4 z-50 min-w-[260px]">
                    <p className="text-xs text-gray-400 font-medium mb-3">Aspect Ratio</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ASPECT_RATIOS.map(r => (
                        <button
                          key={r.value}
                          onClick={() => { onRatioChange(r.value); }}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                            selectedRatio === r.value
                              ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                              : 'text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-600 mt-3">
                      Current: <span className="text-gray-400">{selectedRatio}</span>
                      <span className="ml-2 text-gray-700">{ASPECT_RATIOS.find(r => r.value === selectedRatio)?.pixels}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thin separator below tabs */}
          <div className="mx-3 border-b border-white/5" />

          {/* ── Textarea ── */}
          <div className="px-4 pt-3 pb-2">
            {activeTab === 'positive' ? (
              <textarea
                value={prompt}
                onChange={e => handleTextareaInput(e, setPrompt)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the image you want to create... (Ctrl+Enter to generate)"
                rows={2}
                className="w-full bg-transparent text-white text-sm placeholder:text-gray-600 resize-none focus:outline-none leading-relaxed"
                style={{ minHeight: '48px', maxHeight: '140px' }}
              />
            ) : (
              <textarea
                value={negativePrompt}
                onChange={e => handleTextareaInput(e, setNegativePrompt)}
                onKeyDown={handleKeyDown}
                placeholder="Things to avoid (e.g. blurry, bad hands, text)..."
                rows={2}
                className="w-full bg-transparent text-white text-sm placeholder:text-gray-600 resize-none focus:outline-none leading-relaxed"
                style={{ minHeight: '48px', maxHeight: '140px' }}
              />
            )}
          </div>

          {/* ── Bottom controls inside the box ── */}
          <div className="flex items-center justify-between gap-2 px-3 pb-3">

            {/* Left: Free Generation toggle */}
            <button
              onClick={canUseFreeCreation ? onFreeCreationToggle : undefined}
              title={canUseFreeCreation ? 'Toggle Free Generation mode' : 'Upgrade to Standard to unlock Free Generation'}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all ${
                canUseFreeCreation
                  ? freeCreationActive
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'text-gray-400 hover:text-gray-300 bg-white/5 hover:bg-white/10 border-white/10'
                  : 'text-gray-700 bg-white/[0.02] border-white/5 cursor-not-allowed opacity-50'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${freeCreationActive && canUseFreeCreation ? 'text-purple-400' : ''}`} />
              <span className="hidden sm:inline">Free Gen</span>
              {/* Toggle pill */}
              <div className={`relative w-6 h-3 rounded-full transition-colors ml-0.5 flex-shrink-0 ${
                freeCreationActive && canUseFreeCreation ? 'bg-purple-500' : 'bg-gray-700'
              }`}>
                <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all ${
                  freeCreationActive && canUseFreeCreation ? 'left-3.5' : 'left-0.5'
                }`} />
              </div>
            </button>

            {/* Right: Generate button */}
            <button
              onClick={onGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`flex items-center gap-2 font-semibold text-sm px-4 sm:px-5 py-2 rounded-xl transition-all ${
                isGenerating || !prompt.trim()
                  ? 'bg-purple-500/20 text-purple-400/50 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-95'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
              {isGenerating ? 'Generating...' : (freeCreationActive && canUseFreeCreation) ? 'Generate · Free ✨' : `Generate${costLabel ? ` · ${costLabel}` : ''}`}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-700 mt-1.5">
          Ctrl+Enter to generate · 10 💜 per image
        </p>
      </div>
    </div>
  );
}
