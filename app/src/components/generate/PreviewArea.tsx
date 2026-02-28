import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Play,
    Download,
    Share2,
    Video,
    Maximize2,
    RefreshCw,
    ImageIcon,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ContentDetailModal } from './ContentDetailModal';
import type { GeneratedItem } from '@/pages/GeneratePage';

interface PreviewAreaProps {
    isGenerating?: boolean;
    generatedItems?: GeneratedItem[];
    pendingCount?: number;
    onLoadMore?: () => void;
    hasMoreHistory?: boolean;
    loadingMore?: boolean;
}

// Group items by batchId, preserving order of first appearance
function groupByBatch(items: GeneratedItem[]): { batchId: string; items: GeneratedItem[] }[] {
    const batchMap = new Map<string, GeneratedItem[]>();
    const batchOrder: string[] = [];

    for (const item of items) {
        const bid = item.batchId;
        if (!batchMap.has(bid)) {
            batchMap.set(bid, []);
            batchOrder.push(bid);
        }
        batchMap.get(bid)!.push(item);
    }

    return batchOrder.map(bid => ({ batchId: bid, items: batchMap.get(bid)! }));
}

export function PreviewArea({ isGenerating, generatedItems = [], pendingCount = 0, onLoadMore, hasMoreHistory, loadingMore }: PreviewAreaProps) {
    const hasContent = generatedItems.length > 0 || isGenerating;
    const [selectedItem, setSelectedItem] = useState<GeneratedItem | null>(null);
    // Track muted state per video by item id
    const [mutedMap, setMutedMap] = useState<Record<string, boolean>>({});

    // Scroll refs for auto-scroll to bottom + infinite scroll at top
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const hasInitialScrollRef = useRef(false);
    const prevItemCountRef = useRef(0);

    // Auto-scroll to bottom on initial load (so user sees newest generation)
    useEffect(() => {
        if (generatedItems.length > 0 && !hasInitialScrollRef.current && scrollContainerRef.current) {
            // Wait for images to start rendering
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                }
                hasInitialScrollRef.current = true;
            }, 150);
        }
    }, [generatedItems.length]);

    // Smooth scroll to bottom when NEW items are added (not initial load or load-more)
    useEffect(() => {
        const prevCount = prevItemCountRef.current;
        const currentCount = generatedItems.length;
        prevItemCountRef.current = currentCount;

        // Only smooth-scroll for new generations (count increased from non-zero), not initial load
        if (prevCount > 0 && currentCount > prevCount && hasInitialScrollRef.current && scrollContainerRef.current) {
            setTimeout(() => {
                scrollContainerRef.current?.scrollTo({
                    top: scrollContainerRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }, [generatedItems.length]);

    // Infinite scroll: load more when user scrolls near top
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current || !onLoadMore || !hasMoreHistory || loadingMore) return;
        if (scrollContainerRef.current.scrollTop < 200) {
            onLoadMore();
        }
    }, [onLoadMore, hasMoreHistory, loadingMore]);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Group by batch and reverse so oldest batches are at top, newest at bottom
    const batches = groupByBatch([...generatedItems].reverse());

    const toggleMute = (itemId: string, videoEl: HTMLVideoElement) => {
        const currentlyMuted = mutedMap[itemId] !== false; // default muted
        setMutedMap(prev => ({ ...prev, [itemId]: !currentlyMuted }));
        videoEl.muted = !currentlyMuted;
    };

    return (
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-thin p-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                        {generatedItems.length > 0 ? (generatedItems[0].mediaType === 'video' ? 'Txt2Vid' : 'Txt2Img') : 'Txt2Img'}
                    </Badge>
                    {isGenerating && pendingCount > 0 && (
                        <span className="text-emerald-400 text-sm flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            {pendingCount} generating...
                        </span>
                    )}
                </div>
            </div>

            {/* Empty State */}
            {!hasContent && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-30" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No generations yet</h3>
                    <p className="text-sm text-gray-600 text-center max-w-md">
                        Enter a prompt below and click Generate to create your first image or video.
                    </p>
                </div>
            )}

            {/* Generated Content — Each batch is a row, images side-by-side */}
            {hasContent && (
                <div className="flex flex-col gap-6 pb-40">

                    {/* Loading indicator for older generations */}
                    {loadingMore && (
                        <div className="text-center py-4">
                            <RefreshCw className="w-4 h-4 animate-spin text-gray-500 mx-auto mb-1" />
                            <span className="text-gray-600 text-xs">Loading older generations...</span>
                        </div>
                    )}

                    {batches.map((batch) => (
                        <div key={batch.batchId} className="space-y-2">
                            {/* Batch prompt label */}
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500 text-xs truncate max-w-lg">{batch.items[0].prompt}</p>
                                <span className="text-gray-700 text-[10px] shrink-0">
                                    {new Date(batch.items[0].createdAt).toLocaleString()} · {batch.items.length} {batch.items.length === 1 ? 'image' : 'images'}
                                </span>
                            </div>

                            {/* Items row — side by side */}
                            <div className="flex gap-3">
                                {batch.items.map((item, index) => (
                                    <div key={item.id} className="relative group w-[360px] shrink-0">
                                        <div className="relative rounded-xl overflow-hidden bg-[#1A1E1C] border border-white/5">
                                            {item.mediaType === 'video' ? (
                                                <>
                                                    <video
                                                        src={item.mediaUrl}
                                                        className="w-full h-auto object-cover cursor-pointer"
                                                        muted
                                                        loop
                                                        playsInline
                                                        preload="metadata"
                                                        onClick={(e) => {
                                                            const v = e.target as HTMLVideoElement;
                                                            if (v.paused) {
                                                                v.play();
                                                                // Hide play button
                                                                const playBtn = v.parentElement?.querySelector('.play-overlay') as HTMLElement;
                                                                if (playBtn) playBtn.style.display = 'none';
                                                            } else {
                                                                v.pause();
                                                                const playBtn = v.parentElement?.querySelector('.play-overlay') as HTMLElement;
                                                                if (playBtn) playBtn.style.display = 'flex';
                                                            }
                                                        }}
                                                        onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                                                        onMouseLeave={(e) => {
                                                            const v = e.target as HTMLVideoElement;
                                                            v.pause();
                                                            v.currentTime = 0;
                                                            // Reset to muted on mouse leave
                                                            v.muted = true;
                                                            setMutedMap(prev => ({ ...prev, [item.id]: true }));
                                                            const playBtn = v.parentElement?.querySelector('.play-overlay') as HTMLElement;
                                                            if (playBtn) playBtn.style.display = 'flex';
                                                        }}
                                                    />
                                                    <div className="play-overlay absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                                            <Play className="w-5 h-5 text-white fill-white" />
                                                        </div>
                                                    </div>
                                                    {/* Video badge */}
                                                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 flex items-center gap-1 pointer-events-none">
                                                        <Video className="w-3 h-3 text-white" />
                                                        <span className="text-white text-[10px]">Video</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <img
                                                    src={item.mediaUrl}
                                                    alt={item.prompt || `Generated ${index + 1}`}
                                                    className="w-full h-auto cursor-pointer"
                                                    loading="lazy"
                                                    onClick={() => setSelectedItem(item)}
                                                />
                                            )}

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 pointer-events-none">
                                                <div className="flex gap-1.5 w-full justify-between pointer-events-auto">
                                                    {/* Left side buttons */}
                                                    <div className="flex gap-1.5">
                                                        {/* Audio toggle — video only */}
                                                        {item.mediaType === 'video' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const container = (e.currentTarget as HTMLElement).closest('.relative.group');
                                                                    const videoEl = container?.querySelector('video');
                                                                    if (videoEl) toggleMute(item.id, videoEl);
                                                                }}
                                                                className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                                                title={mutedMap[item.id] !== false ? 'Unmute' : 'Mute'}
                                                            >
                                                                {mutedMap[item.id] !== false
                                                                    ? <VolumeX className="w-3.5 h-3.5" />
                                                                    : <Volume2 className="w-3.5 h-3.5" />
                                                                }
                                                            </button>
                                                        )}
                                                        <a
                                                            href={item.mediaUrl}
                                                            download
                                                            className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </a>
                                                        <button className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                                                            <Share2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    {/* Right side — Fullscreen / Detail button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedItem(item);
                                                        }}
                                                        className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                                        title="View details"
                                                    >
                                                        <Maximize2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Loading skeleton for pending generation — at the bottom */}
                    {isGenerating && Array.from({ length: pendingCount || 1 }).map((_, i) => (
                        <div key={`skeleton-${i}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <p className="text-gray-600 text-xs">Generating...</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative rounded-xl overflow-hidden bg-[#1A1E1C] border border-white/5 w-[360px] aspect-[2/3] animate-pulse shrink-0">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                                            <span className="text-emerald-400 text-sm font-medium">Generating...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Content Detail Modal */}
            {selectedItem && (
                <ContentDetailModal
                    item={selectedItem}
                    batchItems={generatedItems.filter(i => i.batchId === selectedItem.batchId).reverse()}
                    onClose={() => setSelectedItem(null)}
                    onNavigate={(item) => setSelectedItem(item)}
                />
            )}
        </div>
    );
}
