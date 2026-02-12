import { useState } from 'react';
import {
    Image,
    Video,
    Grid3X3,
    ChevronDown,
    LayoutTemplate,
    Zap,
    Info,
    Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { getDefaultModel } from '@/data/modelData';
import type { Model } from '@/data/modelData';
import { ModelSelectorModal } from './ModelSelectorModal';

// Aspect ratio options
const aspectRatios = [
    { id: '2:3', label: '2:3', width: 40, height: 60 },
    { id: '1:1', label: '1:1', width: 40, height: 40 },
    { id: '9:16', label: '9:16', width: 30, height: 60 },
    { id: '4:3', label: '4:3', width: 50, height: 40 },
    { id: 'more', label: 'More', icon: Layers },
];

// Image quantity options
const quantityOptions = [1, 2, 3, 4];

// Video resolution options
const videoResolutionOptions = [
    { id: '480p', label: '480p', width: 854, height: 480 },
    { id: '720p', label: '720p', width: 1280, height: 720 },
    { id: '1080p', label: '1080p', width: 1920, height: 1080 },
    { id: '4k', label: '4K', width: 3840, height: 2160 },
];

// Video FPS options
const fpsOptions = [24, 30, 60];

// Video duration options (seconds)
const durationOptions = [3, 5, 10, 15];

// Video quantity options
const videoQuantityOptions = [1, 2, 3, 4];

interface SettingsPanelProps {
    mode: string;
    generationMode: 'standard' | 'quality';
    setGenerationMode: (mode: 'standard' | 'quality') => void;
    selectedRatio: string;
    setSelectedRatio: (ratio: string) => void;
    imageQuantity: number;
    setImageQuantity: (num: number) => void;
    videoResolution: string;
    setVideoResolution: (res: string) => void;
    videoFps: number;
    setVideoFps: (fps: number) => void;
    videoDuration: number;
    setVideoDuration: (dur: number) => void;
    videoQuantity: number;
    setVideoQuantity: (num: number) => void;
    privateCreation: boolean;
    setPrivateCreation: (val: boolean) => void;
    freeCreation: boolean;
    setFreeCreation: (val: boolean) => void;
    advancedOpen: boolean;
    setAdvancedOpen: (val: boolean) => void;
}

export function SettingsPanel({
    mode,
    generationMode,
    setGenerationMode,
    selectedRatio,
    setSelectedRatio,
    imageQuantity,
    setImageQuantity,
    videoResolution,
    setVideoResolution,
    videoFps,
    setVideoFps,
    videoDuration,
    setVideoDuration,
    videoQuantity,
    setVideoQuantity,
    privateCreation,
    setPrivateCreation,
    freeCreation,
    setFreeCreation,
    advancedOpen,
    setAdvancedOpen
}: SettingsPanelProps) {
    const navigate = useNavigate();
    const isVideoMode = mode === 'video';

    // Model selection state
    const [showModelModal, setShowModelModal] = useState(false);
    const [selectedModel, setSelectedModel] = useState<Model>(
        getDefaultModel(isVideoMode ? 'video' : 'image')
    );

    const handleModelSelect = (model: Model) => {
        setSelectedModel(model);
        // Navigate to the correct mode based on model type
        if (model.type === 'video' && !isVideoMode) {
            navigate('/generate/video');
        } else if (model.type === 'image' && isVideoMode) {
            navigate('/generate/image');
        }
    };

    return (
        <div className="w-80 bg-[#141816] border-r border-white/5 ml-16 flex flex-col h-screen">
            {/* Image/Video Toggle - Above Model Selector */}
            <div className="p-4 border-b border-white/5">
                <div className="flex gap-1 bg-[#0D0F0E] rounded-lg p-1">
                    <button
                        onClick={() => navigate('/generate/image')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${!isVideoMode
                            ? 'bg-[#1A1E1C] text-white'
                            : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <Image className="w-4 h-4" />
                        Image
                    </button>
                    <button
                        onClick={() => navigate('/generate/video')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${isVideoMode
                            ? 'bg-[#1A1E1C] text-white'
                            : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <Video className="w-4 h-4" />
                        Video
                    </button>
                </div>
            </div>

            {/* Model Selector */}
            <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-emerald-400 text-xs font-medium">Model</span>
                    <button className="text-gray-500 hover:text-white">
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                </div>

                {/* Model Selector Button with Background Image */}
                <button
                    onClick={() => setShowModelModal(true)}
                    className="relative w-full overflow-hidden rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all group"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <img
                            src={selectedModel.image}
                            alt={selectedModel.name}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0F0E]/90 via-[#0D0F0E]/70 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative p-3 flex items-center justify-between">
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-gray-400 text-[10px] uppercase tracking-wide">Model</span>
                            <div className="flex items-center gap-2">
                                <span className="text-white text-sm font-semibold">{selectedModel.name}</span>
                                <Info className="w-3 h-3 text-gray-500" />
                                <Grid3X3 className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="text-gray-500 text-xs">{selectedModel.version}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                </button>

                <button className="w-full mt-2 p-2.5 bg-[#1A1E1C] rounded-lg border border-white/5 text-gray-400 text-sm hover:text-white hover:border-white/10 transition-colors flex items-center justify-center gap-2">
                    <LayoutTemplate className="w-4 h-4" />
                    Combo Library
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] border-0 ml-1">NEW</Badge>
                </button>
            </div>

            {/* Model Selector Modal */}
            <ModelSelectorModal
                isOpen={showModelModal}
                onClose={() => setShowModelModal(false)}
                onSelect={handleModelSelect}
                initialMode={isVideoMode ? 'video' : 'image'}
                selectedModelId={selectedModel.id}
            />

            {/* Scrollable Settings Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="p-4 space-y-4">
                    {/* Additional Section */}
                    <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">Additional</span>
                        <button className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Zap className="w-3 h-3 text-emerald-400" />
                        </button>
                    </div>

                    {/* Basic Settings */}
                    <div className="bg-[#1A1E1C] rounded-xl border border-white/5 overflow-hidden">
                        <button className="w-full flex items-center justify-between p-3">
                            <span className="text-white text-sm">Basic Settings</span>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>

                        <div className="px-3 pb-3 space-y-4">
                            {/* Generation Mode */}
                            <div>
                                <div className="flex items-center gap-1 mb-2">
                                    <span className="text-gray-400 text-xs">Generation Mode</span>
                                    <Info className="w-3 h-3 text-gray-600" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setGenerationMode('standard')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${generationMode === 'standard'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-[#141816] text-gray-400 border border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        Standard
                                    </button>
                                    <button
                                        onClick={() => setGenerationMode('quality')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${generationMode === 'quality'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-[#141816] text-gray-400 border border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <Zap className="w-3 h-3" />
                                        Quality
                                    </button>
                                </div>
                            </div>

                            {/* Video Resolution - Only for Video Mode */}
                            {isVideoMode && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-xs">Video Resolution</span>
                                        <span className="text-gray-600 text-xs">
                                            {videoResolutionOptions.find(r => r.id === videoResolution)?.width} × {videoResolutionOptions.find(r => r.id === videoResolution)?.height}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
                                        {videoResolutionOptions.map((resolution) => (
                                            <button
                                                key={resolution.id}
                                                onClick={() => setVideoResolution(resolution.id)}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all flex-shrink-0 ${videoResolution === resolution.id
                                                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                                                    : 'bg-[#141816] border border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                <div
                                                    className={`border-2 rounded ${videoResolution === resolution.id ? 'border-emerald-400' : 'border-gray-500'
                                                        }`}
                                                    style={{
                                                        width: resolution.id === '4k' ? 50 : resolution.id === '1080p' ? 45 : resolution.id === '720p' ? 40 : 35,
                                                        height: resolution.id === '4k' ? 28 : resolution.id === '1080p' ? 25 : resolution.id === '720p' ? 22 : 20
                                                    }}
                                                />
                                                <span className={`text-[10px] ${videoResolution === resolution.id ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                    {resolution.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Image Settings */}
                            {!isVideoMode && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-xs">Image Settings</span>
                                        <span className="text-gray-600 text-xs">688 × 1024</span>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
                                        {aspectRatios.map((ratio) => (
                                            <button
                                                key={ratio.id}
                                                onClick={() => setSelectedRatio(ratio.id)}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all flex-shrink-0 ${selectedRatio === ratio.id
                                                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                                                    : 'bg-[#141816] border border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                {ratio.icon ? (
                                                    <ratio.icon className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <div
                                                        className={`border-2 rounded ${selectedRatio === ratio.id ? 'border-emerald-400' : 'border-gray-500'
                                                            }`}
                                                        style={{ width: ratio.width, height: ratio.height }}
                                                    />
                                                )}
                                                <span className={`text-[10px] ${selectedRatio === ratio.id ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                    {ratio.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Image Quantity */}
                            {!isVideoMode && (
                                <div>
                                    <span className="text-gray-400 text-xs block mb-2">Image Quantity</span>
                                    <div className="flex gap-2">
                                        {quantityOptions.map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setImageQuantity(num)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${imageQuantity === num
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-[#141816] text-gray-400 border border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Video FPS */}
                            {isVideoMode && (
                                <div>
                                    <span className="text-gray-400 text-xs block mb-2">FPS (Frames Per Second)</span>
                                    <div className="flex gap-2">
                                        {fpsOptions.map((fps) => (
                                            <button
                                                key={fps}
                                                onClick={() => setVideoFps(fps)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${videoFps === fps
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-[#141816] text-gray-400 border border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                {fps}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Video Duration */}
                            {isVideoMode && (
                                <div>
                                    <span className="text-gray-400 text-xs block mb-2">Duration (Seconds)</span>
                                    <div className="flex gap-2">
                                        {durationOptions.map((duration) => (
                                            <button
                                                key={duration}
                                                onClick={() => setVideoDuration(duration)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${videoDuration === duration
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-[#141816] text-gray-400 border border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                {duration}s
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Video Quantity - Only for Video Mode */}
                            {isVideoMode && (
                                <div>
                                    <span className="text-gray-400 text-xs block mb-2">Video Quantity</span>
                                    <div className="flex gap-2">
                                        {videoQuantityOptions.map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setVideoQuantity(num)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${videoQuantity === num
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-[#141816] text-gray-400 border border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Private Creation Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-400 text-xs">Private Creation</span>
                                    <Zap className="w-3 h-3 text-amber-400" />
                                    <Info className="w-3 h-3 text-gray-600" />
                                </div>
                                <Switch
                                    checked={privateCreation}
                                    onCheckedChange={setPrivateCreation}
                                    className="data-[state=checked]:bg-emerald-500"
                                />
                            </div>

                            {/* Free Creation Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-400 text-xs">Free Creation</span>
                                    <Zap className="w-3 h-3 text-amber-400" />
                                    <Info className="w-3 h-3 text-gray-600" />
                                </div>
                                <Switch
                                    checked={freeCreation}
                                    onCheckedChange={setFreeCreation}
                                    className="data-[state=checked]:bg-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Advanced Config - Right above Reset/Notes */}
                    <button
                        onClick={() => setAdvancedOpen(!advancedOpen)}
                        className="w-full flex items-center justify-between p-3 bg-[#1A1E1C] rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <span className="text-white text-sm">Advanced Config</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}
