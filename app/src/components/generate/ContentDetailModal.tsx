import { useEffect, useRef, useState, useCallback } from 'react';
import {
    X,
    Volume2,
    VolumeX,
    Video,
    Calendar,
    Layers,
    Type,
    Ratio,
    Clock,
    Sparkles,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { getModelById } from '@/data/modelData';
import type { GeneratedItem } from '@/pages/GeneratePage';

interface ContentDetailModalProps {
    item: GeneratedItem;
    batchItems: GeneratedItem[];  // All items in the same batch
    onClose: () => void;
    onNavigate: (item: GeneratedItem) => void;  // Switch to different item in batch
}

export function ContentDetailModal({ item, batchItems, onClose, onNavigate }: ContentDetailModalProps) {
    const [isMuted, setIsMuted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const currentIndex = batchItems.findIndex(i => i.id === item.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < batchItems.length - 1;
    const showArrows = batchItems.length > 1;

    const goToPrev = useCallback(() => {
        if (hasPrev) onNavigate(batchItems[currentIndex - 1]);
    }, [hasPrev, currentIndex, batchItems, onNavigate]);

    const goToNext = useCallback(() => {
        if (hasNext) onNavigate(batchItems[currentIndex + 1]);
    }, [hasNext, currentIndex, batchItems, onNavigate]);

    // Close on Escape, navigate with arrow keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose, goToPrev, goToNext]);

    // Prevent body scroll while modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const model = getModelById(item.modelId);
    const variant = model?.variants?.find(v => v.id === item.settings?.variantId);

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Left Navigation Arrow */}
            {showArrows && hasPrev && (
                <button
                    onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                    className="absolute left-4 z-[10000] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}

            {/* Right Navigation Arrow */}
            {showArrows && hasNext && (
                <button
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    className="absolute right-4 z-[10000] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            )}

            <div
                className="relative flex w-[90vw] max-w-[1400px] h-[85vh] bg-[#141816] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left: Media Preview */}
                <div className="flex-1 flex items-center justify-center bg-black/40 p-6 min-w-0">
                    {item.mediaType === 'video' ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <video
                                ref={videoRef}
                                src={item.mediaUrl}
                                className="max-w-full max-h-full rounded-xl object-contain"
                                controls
                                autoPlay
                                loop
                                muted={isMuted}
                                playsInline
                            />
                            {/* Mute toggle overlay */}
                            <button
                                onClick={() => {
                                    setIsMuted(!isMuted);
                                    if (videoRef.current) videoRef.current.muted = !isMuted;
                                }}
                                className="absolute bottom-4 left-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                        </div>
                    ) : (
                        <img
                            src={item.mediaUrl}
                            alt={item.prompt || 'Generated content'}
                            className="max-w-full max-h-full rounded-xl object-contain"
                        />
                    )}
                </div>

                {/* Right: Settings Panel */}
                <div className="w-[340px] shrink-0 border-l border-white/10 overflow-y-auto scrollbar-thin p-5 flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                        <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${item.mediaType === 'video'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                            {item.mediaType === 'video' ? 'Video' : 'Image'}
                        </div>
                        <span className="text-gray-500 text-xs">
                            {new Date(item.createdAt).toLocaleString()}
                        </span>
                        {/* Batch counter */}
                        {showArrows && (
                            <span className="text-gray-600 text-xs ml-auto">
                                {currentIndex + 1} / {batchItems.length}
                            </span>
                        )}
                    </div>

                    {/* Prompt */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                            <Type className="w-3.5 h-3.5" />
                            Prompt
                        </div>
                        <p className="text-gray-200 text-sm leading-relaxed bg-white/5 rounded-lg p-3 border border-white/5">
                            {item.prompt || 'No prompt'}
                        </p>
                    </div>

                    {/* Model */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            Model
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/5">
                            {model?.image && (
                                <img src={model.image} alt={model.name} className="w-10 h-10 rounded-lg object-cover" />
                            )}
                            <div>
                                <p className="text-white text-sm font-medium">{model?.name || `Model #${item.modelId}`}</p>
                                {model?.version && (
                                    <p className="text-gray-500 text-xs">{model.version}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Variant (if applicable) */}
                    {variant && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                                <Layers className="w-3.5 h-3.5" />
                                Variant
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-white text-sm">{variant.name}</p>
                                {variant.description && (
                                    <p className="text-gray-500 text-xs mt-1">{variant.description}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Settings Grid */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                            <Layers className="w-3.5 h-3.5" />
                            Settings
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {item.settings?.ratio && (
                                <SettingCard icon={<Ratio className="w-3.5 h-3.5" />} label="Ratio" value={item.settings.ratio} />
                            )}
                            {item.settings?.duration && (
                                <SettingCard icon={<Clock className="w-3.5 h-3.5" />} label="Duration" value={`${item.settings.duration}s`} />
                            )}
                            {item.settings?.resolution && (
                                <SettingCard icon={<Video className="w-3.5 h-3.5" />} label="Resolution" value={item.settings.resolution} />
                            )}
                            <SettingCard icon={<Calendar className="w-3.5 h-3.5" />} label="Created" value={new Date(item.createdAt).toLocaleDateString()} />
                        </div>
                    </div>

                    {/* Download button */}
                    <a
                        href={item.mediaUrl}
                        download
                        className="mt-auto w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium text-center transition-colors"
                    >
                        Download
                    </a>
                </div>
            </div>
        </div>
    );
}

function SettingCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider mb-1">
                {icon}
                {label}
            </div>
            <p className="text-white text-sm font-medium">{value}</p>
        </div>
    );
}
