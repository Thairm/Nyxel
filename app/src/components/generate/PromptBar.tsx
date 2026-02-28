import { useRef, useEffect, useState } from 'react';

interface PromptBarProps {
    prompt: string;
    setPrompt: (value: string) => void;
    negativePrompt: string;
    setNegativePrompt: (value: string) => void;
    showNegativePrompt: boolean;
    onGenerate: () => void;
    isGenerating?: boolean;
}

export function PromptBar({
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    showNegativePrompt,
    onGenerate,
    isGenerating,
}: PromptBarProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [activeTab, setActiveTab] = useState<'positive' | 'negative'>('positive');

    // Auto-expand textarea up to max height
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    }, [prompt, negativePrompt, activeTab]);

    const currentValue = activeTab === 'positive' ? prompt : negativePrompt;
    const currentSetter = activeTab === 'positive' ? setPrompt : setNegativePrompt;

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
            {/* Prompt Tabs — only show when model supports negative prompt */}
            {showNegativePrompt && (
                <div className="flex gap-0 mb-0">
                    <button
                        onClick={() => setActiveTab('positive')}
                        className={`px-4 py-1.5 text-xs font-medium rounded-t-lg transition-all ${activeTab === 'positive'
                                ? 'bg-[#1A1E1C]/90 text-white border-t border-l border-r border-white/10'
                                : 'bg-[#141816]/60 text-gray-500 hover:text-gray-300 border-t border-l border-r border-white/5'
                            }`}
                    >
                        Prompt
                    </button>
                    <button
                        onClick={() => setActiveTab('negative')}
                        className={`px-4 py-1.5 text-xs font-medium rounded-t-lg transition-all ${activeTab === 'negative'
                                ? 'bg-[#1A1E1C]/90 text-white border-t border-l border-r border-white/10'
                                : 'bg-[#141816]/60 text-gray-500 hover:text-gray-300 border-t border-l border-r border-white/5'
                            }`}
                    >
                        Negative
                        {negativePrompt && (
                            <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                        )}
                    </button>
                </div>
            )}

            {/* Prompt Bar */}
            <div className={`flex items-start gap-2 bg-[#1A1E1C]/90 backdrop-blur-md border border-white/10 px-4 py-3 transition-all duration-300 hover:border-emerald-500/20 ${showNegativePrompt ? 'rounded-b-2xl rounded-tr-2xl' : 'rounded-2xl'
                }`}>
                {/* Prompt Textarea */}
                <textarea
                    ref={textareaRef}
                    value={currentValue}
                    onChange={(e) => currentSetter(e.target.value)}
                    placeholder={activeTab === 'positive'
                        ? 'What do you want to create?'
                        : 'What to avoid in the generation...'
                    }
                    rows={1}
                    className="flex-1 bg-transparent text-white placeholder:text-gray-400 outline-none text-sm min-w-0 font-medium px-2 py-1 resize-none overflow-y-auto scrollbar-thin max-h-[120px]"
                />

                {/* Right Side Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                    <button
                        onClick={onGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="px-6 py-2.5 bg-gradient-emerald text-white rounded-full font-bold text-sm hover:opacity-90 hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>
        </div>
    );
}
