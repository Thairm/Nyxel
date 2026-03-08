import { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown, Plus, Minus } from 'lucide-react';
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
}

const ASPECT_RATIOS = [
  { label: '1:1', value: '1:1' },
  { label: '2:3', value: '2:3' },
  { label: '3:2', value: '3:2' },
  { label: '9:16', value: '9:16' },
  { label: '16:9', value: '16:9' },
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
}: PromptBarProps) {
  const [activeTab, setActiveTab] = useState<PromptTab>('positive');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close model dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
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
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onGenerate();
    }
  };

  const hasNegativePrompt = negativePrompt.trim().length > 0;

  return (
    <div className="bg-[#0D0F0E] px-3 sm:px-6 py-3 sm:py-4">
      <div className="max-w-4xl mx-auto">

        {/* ── Prompt Container ── */}
        <div className="relative bg-[#141816] border border-white/10 rounded-2xl overflow-hidden focus-within:border-purple-500/40 transition-colors">

          {/* Tab switcher */}
          <div className="flex items-center gap-1 px-3 pt-3 pb-1">
            <button
              onClick={() => setActiveTab('positive')}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'positive'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Plus className="w-3 h-3" />
              Prompt
            </button>
            <button
              onClick={() => setActiveTab('negative')}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors relative ${
                activeTab === 'negative'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Minus className="w-3 h-3" />
              Negative
              {hasNegativePrompt && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-400" />
              )}
            </button>
          </div>

          {/* Text areas */}
          <div className="px-3 pb-2">
            {activeTab === 'positive' ? (
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => handleTextareaInput(e, setPrompt)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the image you want to create... (Ctrl+Enter to generate)"
                rows={2}
                className="w-full bg-transparent text-white text-sm placeholder:text-gray-600 resize-none focus:outline-none leading-relaxed"
                style={{ minHeight: '52px', maxHeight: '120px' }}
              />
            ) : (
              <textarea
                value={negativePrompt}
                onChange={e => handleTextareaInput(e, setNegativePrompt)}
                onKeyDown={handleKeyDown}
                placeholder="Things to avoid in the image (e.g. blurry, bad hands, text)"
                rows={2}
                className="w-full bg-transparent text-white text-sm placeholder:text-gray-600 resize-none focus:outline-none leading-relaxed"
                style={{ minHeight: '52px', maxHeight: '120px' }}
              />
            )}
          </div>

          {/* ── Bottom Controls Row ── */}
          <div className="flex items-center justify-between gap-2 px-3 pb-3 flex-wrap sm:flex-nowrap">

            {/* Left: Aspect ratio pills */}
            <div className="flex items-center gap-1 flex-wrap">
              {ASPECT_RATIOS.map(r => (
                <button
                  key={r.value}
                  onClick={() => onRatioChange(r.value)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedRatio === r.value
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Right: Model dropdown + Generate button */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">

              {/* Model selector dropdown */}
              <div className="relative" ref={modelDropdownRef}>
                <button
                  onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>{selectedModel.name}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {modelDropdownOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-52 bg-[#1a1d1b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
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
                            {model.badge && (
                              <div className="text-[10px] text-purple-400">{model.badge}</div>
                            )}
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

              {/* Generate Button */}
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
                <span className="hidden sm:inline">
                  {isGenerating ? 'Generating...' : `Generate ${costLabel ? `· ${costLabel}` : ''}`}
                </span>
                <span className="sm:hidden">
                  {isGenerating ? '...' : 'Generate'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Hint text */}
        <p className="text-center text-[10px] text-gray-700 mt-2">
          Ctrl+Enter to generate · 10 💜 per image
        </p>
      </div>
    </div>
  );
}
