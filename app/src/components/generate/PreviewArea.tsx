import { Badge } from '@/components/ui/badge';
import {
    Play,
    Download,
    Share2,
    Video,
    LayoutGrid,
    SlidersHorizontal,
    Maximize2,
    MessageSquare,
    Info,
    RotateCcw,
    MoreVertical
} from 'lucide-react';

// Sample generated images
const generatedImages = [
    { id: 1, src: '/gen-preview-1.jpg', type: 'image', width: 688, height: 1024 },
    { id: 2, src: '/gen-preview-2.jpg', type: 'image', width: 688, height: 1024 },
    { id: 3, src: '/gen-preview-3.jpg', type: 'image', width: 688, height: 1024 },
    { id: 4, src: '/gen-preview-4.jpg', type: 'image', width: 688, height: 1024 },
];

// Sample generated videos
const generatedVideos = [
    { id: 5, src: '/gen-preview-1.jpg', type: 'video', duration: 5, fps: 30 },
    { id: 6, src: '/gen-preview-2.jpg', type: 'video', duration: 10, fps: 24 },
    { id: 7, src: '/gen-preview-3.jpg', type: 'video', duration: 15, fps: 60 },
    { id: 8, src: '/gen-preview-4.jpg', type: 'video', duration: 5, fps: 30 },
];

// Combined gallery
const allGeneratedContent = [...generatedImages, ...generatedVideos];

export function PreviewArea() {
    return (
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Txt2Img</Badge>
                    <span className="text-gray-400 text-sm truncate max-w-2xl">
                        Enchanted forest landscape at twilight, giant ethereal mushrooms emitting soft neon light, a mysterious woodland creature with glowing antlers...
                    </span>
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

            {/* Image Info Bar - MOVED TO TOP of generated images */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                            S
                        </div>
                        <span className="text-gray-400 text-sm">SeaArt Infinity</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Maximize2 className="w-3 h-3" />
                        688 × 1024px
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <Info className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Generated Content Grid (Images + Videos) */}
            <div className="grid grid-cols-4 gap-4 pb-40">
                {allGeneratedContent.map((item, index) => (
                    <div key={item.id} className="relative group">
                        <div className="relative rounded-xl overflow-hidden bg-[#1A1E1C] border border-white/5">
                            <img
                                src={item.src}
                                alt={`Generated ${index + 1}`}
                                className="w-full h-auto object-cover"
                            />
                            {/* Play Icon for Videos */}
                            {item.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                        <Play className="w-6 h-6 text-white fill-white" />
                                    </div>
                                </div>
                            )}
                            {/* Video Info Badge */}
                            {item.type === 'video' && (
                                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 flex items-center gap-1">
                                    <Video className="w-3 h-3 text-white" />
                                    <span className="text-white text-xs">{(item as typeof generatedVideos[0]).duration}s @ {(item as typeof generatedVideos[0]).fps}fps</span>
                                </div>
                            )}
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                                    <Download className="w-5 h-5" />
                                </button>
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
        </div>
    );
}
