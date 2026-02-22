import { Badge } from '@/components/ui/badge';
import {
    Play,
    Download,
    Share2,
    Video,
    LayoutGrid,
    SlidersHorizontal,
    Maximize2,
    RefreshCw,
    ImageIcon,
} from 'lucide-react';
import type { GeneratedItem } from '@/pages/GeneratePage';

interface PreviewAreaProps {
    isGenerating?: boolean;
    generatedItems?: GeneratedItem[];
    pendingCount?: number;
}

export function PreviewArea({ isGenerating, generatedItems = [], pendingCount = 0 }: PreviewAreaProps) {
    const hasContent = generatedItems.length > 0 || isGenerating;

    return (
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                        {generatedItems.length > 0 ? (generatedItems[0].mediaType === 'video' ? 'Txt2Vid' : 'Txt2Img') : 'Txt2Img'}
                    </Badge>
                    {generatedItems.length > 0 && (
                        <span className="text-gray-400 text-sm truncate max-w-2xl">
                            {generatedItems[0].prompt}
                        </span>
                    )}
                    {isGenerating && pendingCount > 0 && (
                        <span className="text-emerald-400 text-sm flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            {pendingCount} generating...
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg bg-[#1A1E1C] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/10 transition-colors">
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-[#1A1E1C] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/10 transition-colors">
                        <SlidersHorizontal className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-[#1A1E1C] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/10 transition-colors">
                        <Maximize2 className="w-4 h-4" />
                    </button>
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

            {/* Generated Content Grid */}
            {hasContent && (
                <div className={`grid grid-cols-4 gap-4 pb-40 relative transition-all duration-300 ${isGenerating ? 'opacity-80' : ''}`}>

                    {/* Loading skeletons for pending jobs */}
                    {isGenerating && Array.from({ length: pendingCount || 1 }).map((_, i) => (
                        <div key={`skeleton-${i}`} className="relative rounded-xl overflow-hidden bg-[#1A1E1C] border border-white/5 aspect-[2/3] animate-pulse">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                                    <span className="text-emerald-400 text-sm font-medium">Generating...</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Real generated content */}
                    {generatedItems.map((item, index) => (
                        <div key={item.id} className="relative group">
                            <div className="relative rounded-xl overflow-hidden bg-[#1A1E1C] border border-white/5">
                                {item.mediaType === 'video' ? (
                                    <>
                                        <video
                                            src={item.mediaUrl}
                                            className="w-full h-auto object-cover"
                                            muted
                                            loop
                                            onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                                            onMouseLeave={(e) => {
                                                const v = e.target as HTMLVideoElement;
                                                v.pause();
                                                v.currentTime = 0;
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:hidden">
                                            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                                <Play className="w-6 h-6 text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 flex items-center gap-1">
                                            <Video className="w-3 h-3 text-white" />
                                            <span className="text-white text-xs">Video</span>
                                        </div>
                                    </>
                                ) : (
                                    <img
                                        src={item.mediaUrl}
                                        alt={item.prompt || `Generated ${index + 1}`}
                                        className="w-full h-auto object-cover"
                                        loading="lazy"
                                    />
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <a
                                        href={item.mediaUrl}
                                        download
                                        className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                    <button className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content Number Badge */}
                                <div className="absolute top-2 right-2 w-6 h-6 rounded bg-black/60 flex items-center justify-center text-white text-xs font-medium">
                                    {index + 1}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
