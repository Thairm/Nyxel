import { Wand2, ImagePlus, LayoutGrid, MessageSquare } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface PromptBarProps {
    prompt: string;
    setPrompt: (value: string) => void;
}

export function PromptBar({ prompt, setPrompt }: PromptBarProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-expand textarea up to max height
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Reset height to auto to get the correct scrollHeight
            textarea.style.height = 'auto';
            // Set height to scrollHeight, capped at max-height (handled by CSS)
            textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
        }
    }, [prompt]);

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
            {/* Play It Button - Floating independently */}
            <div className="mb-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#1A1E1C]/60 backdrop-blur-sm rounded-full border border-white/5 text-gray-300 hover:text-white hover:border-white/10 hover:bg-[#1A1E1C]/80 transition-all text-sm">
                    <Wand2 className="w-4 h-4" />
                    Play It
                </button>
            </div>

            {/* Prompt Bar - Dark background for readability */}
            <div className="flex items-start gap-2 bg-[#1A1E1C]/90 backdrop-blur-md rounded-2xl border border-white/10 px-4 py-3 transition-all duration-300 hover:border-emerald-500/20">
                {/* Left Icon Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0 pt-1">
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors tooltip-trigger" title="Upload Image">
                        <ImagePlus className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors tooltip-trigger" title="Templates">
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>

                {/* Prompt Textarea - Auto-expanding with dark background */}
                <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="What do you want to create?"
                    rows={1}
                    className="flex-1 bg-transparent text-white placeholder:text-gray-400 outline-none text-sm min-w-0 font-medium px-2 py-1 resize-none overflow-y-auto scrollbar-thin max-h-[150px]"
                />

                {/* Right Side Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-emerald-400 transition-colors bg-white/5 rounded-full hover:bg-white/10">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs font-medium">Assistant</span>
                    </button>
                    <button className="px-6 py-2.5 bg-gradient-emerald text-white rounded-full font-bold text-sm hover:opacity-90 hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2">
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
}
