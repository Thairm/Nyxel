import { useState } from 'react';
import {
    Image,
    Grid3X3,
    ChevronDown,
    LayoutTemplate,
    Zap,
    Info,
    Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { hasVariants, getVariantById, getEffectiveParams } from '@/data/modelData';
import type { Model, ParamConfig } from '@/data/modelData';
import { ModelSelectorModal } from './ModelSelectorModal';
import { ImageUploadPanel } from './ImageUploadPanel';
import type { UploadedImage } from './ImageUploadPanel';

// Aspect ratio options with SDXL pixel dimensions
const aspectRatios = [
    { id: '1:1', label: '1:1', width: 40, height: 40, pixels: '1024 × 1024' },
    { id: '2:3', label: '2:3', width: 32, height: 48, pixels: '832 × 1216' },
    { id: '3:2', label: '3:2', width: 48, height: 32, pixels: '1216 × 832' },
    { id: '3:4', label: '3:4', width: 36, height: 48, pixels: '896 × 1152' },
    { id: '4:3', label: '4:3', width: 48, height: 36, pixels: '1152 × 896' },
    { id: '4:5', label: '4:5', width: 38, height: 48, pixels: '960 × 1200' },
    { id: '5:4', label: '5:4', width: 48, height: 38, pixels: '1200 × 960' },
    { id: '9:16', label: '9:16', width: 28, height: 50, pixels: '768 × 1344' },
    { id: '16:9', label: '16:9', width: 50, height: 28, pixels: '1344 × 768' },
    { id: '21:9', label: '21:9', width: 55, height: 24, pixels: '1536 × 640' },
];

// CivitAI scheduler options
const schedulerOptions = [
    'EulerA', 'Euler', 'LMS', 'Heun', 'DPM2', 'DPM2A',
    'DPM2SA', 'DPM2M', 'DPMSDE', 'DPMFast', 'DPMAdaptive',
    'LMSKarras', 'DPM2Karras', 'DPM2AKarras', 'DPM2SAKarras',
    'DPM2MKarras', 'DPMSDEKarras', 'DDIM', 'PLMS', 'UniPC', 'LCM', 'DDPM', 'DEIS',
];

interface SettingsPanelProps {
    mode: string;
    selectedRatio: string;
    setSelectedRatio: (ratio: string) => void;
    imageQuantity: number;
    setImageQuantity: (num: number) => void;
    videoResolution: string;
    setVideoResolution: (res: string) => void;
    videoDuration: number;
    setVideoDuration: (dur: number) => void;
    privateCreation: boolean;
    setPrivateCreation: (val: boolean) => void;
    freeCreation: boolean;
    setFreeCreation: (val: boolean) => void;
    advancedOpen: boolean;
    setAdvancedOpen: (val: boolean) => void;
    // Tier access for Free Creation
    canUseFreeCreation: boolean;
    currentTier: string | null;
    // Model and variant selection
    selectedModel: Model;
    setSelectedModel: (model: Model) => void;
    selectedVariantId?: string;
    setSelectedVariantId?: (variantId: string) => void;
    // CivitAI-specific advanced settings
    seed: number;
    setSeed: (val: number) => void;
    steps: number;
    setSteps: (val: number) => void;
    cfgScale: number;
    setCfgScale: (val: number) => void;
    scheduler: string;
    setScheduler: (val: string) => void;
    clipSkip: number;
    setClipSkip: (val: number) => void;
    // Sora2-style size selector
    videoSize: string;
    setVideoSize: (val: string) => void;
    // Wan 2.6 advanced toggles
    shotType: string;
    setShotType: (val: string) => void;
    promptExpansion: boolean;
    setPromptExpansion: (val: boolean) => void;
    generateAudio: boolean;
    setGenerateAudio: (val: boolean) => void;
    // Image upload state
    uploadedImages: UploadedImage[];
    setUploadedImages: (images: UploadedImage[]) => void;
    lastImage: UploadedImage | null;
    setLastImage: (img: UploadedImage | null) => void;
}

// CivitAI model IDs (community models that support Free Creation)
const CIVITAI_MODEL_IDS = [6, 7, 9, 10, 11, 12, 13, 14];

function isCivitaiModel(modelId: number): boolean {
    return CIVITAI_MODEL_IDS.includes(modelId);
}

export function SettingsPanel({
    mode,
    selectedRatio,
    setSelectedRatio,
    imageQuantity,
    setImageQuantity,
    videoResolution,
    setVideoResolution,
    videoDuration,
    setVideoDuration,
    privateCreation,
    setPrivateCreation,
    freeCreation,
    setFreeCreation,
    advancedOpen,
    setAdvancedOpen,
    canUseFreeCreation,
    currentTier,
    selectedModel,
    setSelectedModel,
    selectedVariantId,
    setSelectedVariantId,
    seed,
    setSeed,
    steps,
    setSteps,
    cfgScale,
    setCfgScale,
    scheduler,
    setScheduler,
    clipSkip,
    setClipSkip,
    videoSize,
    setVideoSize,
    shotType,
    setShotType,
    promptExpansion,
    setPromptExpansion,
    generateAudio,
    setGenerateAudio,
    uploadedImages,
    setUploadedImages,
    lastImage,
    setLastImage,
}: SettingsPanelProps) {
    // Model selection modal state
    const [showModelModal, setShowModelModal] = useState(false);

    // Get current variant info
    const currentVariant = hasVariants(selectedModel) && selectedVariantId
        ? getVariantById(selectedModel, selectedVariantId)
        : undefined;

    // Get supported params for current model/variant
    const params: ParamConfig = getEffectiveParams(selectedModel, selectedVariantId);

    const handleModelSelect = (model: Model, variantId?: string) => {
        setSelectedModel(model);
        if (setSelectedVariantId && variantId) {
            setSelectedVariantId(variantId);
        }
    };

    const handleVariantChange = (variantId: string) => {
        if (setSelectedVariantId) {
            setSelectedVariantId(variantId);
        }
    };

    return (
        <div className="w-80 bg-[#141816] border-r border-white/5 ml-16 flex flex-col h-screen">
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
                            <span className="text-gray-400 text-[10px] uppercase tracking-wide">
                                {hasVariants(selectedModel) && currentVariant ? currentVariant.name : 'Model'}
                            </span>
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

                {/* Variant Selector (for video models with variants) */}
                {hasVariants(selectedModel) && (
                    <div className="mt-3">
                        <span className="text-gray-400 text-[10px] uppercase tracking-wide block mb-2">Variant</span>
                        <div className="relative">
                            <select
                                value={selectedVariantId || selectedModel.defaultVariant}
                                onChange={(e) => handleVariantChange(e.target.value)}
                                className="w-full appearance-none bg-[#1A1E1C] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/30"
                            >
                                {selectedModel.variants?.map((variant) => (
                                    <option key={variant.id} value={variant.id}>
                                        {variant.name} - {variant.pricing}/{variant.pricingUnit === 'per_sec' ? 'sec' : 'pic'}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>

                        {/* Variant Description */}
                        {currentVariant?.description && (
                            <p className="text-gray-600 text-[10px] mt-2">
                                {currentVariant.description}
                            </p>
                        )}

                        {/* Input Type Indicators */}
                        {currentVariant && (
                            <div className="flex gap-1 mt-2">
                                {currentVariant.supportedInputs.includes('text') && (
                                    <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] rounded">
                                        Text
                                    </span>
                                )}
                                {currentVariant.supportedInputs.includes('image') && (
                                    <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] rounded">
                                        Image
                                    </span>
                                )}
                                {currentVariant.supportedInputs.includes('video') && (
                                    <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] rounded">
                                        Video
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <button className="w-full mt-3 p-2.5 bg-[#1A1E1C] rounded-lg border border-white/5 text-gray-400 text-sm hover:text-white hover:border-white/10 transition-colors flex items-center justify-center gap-2">
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
                initialMode="image"
                selectedModelId={selectedModel.id}
                selectedVariantId={selectedVariantId}
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

                    {/* Image Upload Panel — shown when model supports image input */}
                    {params.imageInput && (
                        <div className="bg-[#1A1E1C] rounded-xl border border-white/5 overflow-hidden p-3">
                            <ImageUploadPanel
                                config={params.imageInput}
                                images={uploadedImages}
                                onImagesChange={setUploadedImages}
                                lastImage={lastImage}
                                onLastImageChange={setLastImage}
                            />
                        </div>
                    )}

                    <div className="bg-[#1A1E1C] rounded-xl border border-white/5 overflow-hidden">
                        <button className="w-full flex items-center justify-between p-3">
                            <span className="text-white text-sm">Basic Settings</span>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>

                        <div className="px-3 pb-3 space-y-4">
                            {/* Aspect Ratio / Image Settings — shown when model supports it */}
                            {params.aspectRatio && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-xs">
                                            Image Settings
                                        </span>
                                        {params.widthHeight && (
                                            <span className="text-gray-600 text-xs">
                                                {aspectRatios.find(r => r.id === selectedRatio)?.pixels || '1024 × 1024'}
                                            </span>
                                        )}
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
                                                <div
                                                    className={`border-2 rounded ${selectedRatio === ratio.id ? 'border-emerald-400' : 'border-gray-500'
                                                        }`}
                                                    style={{ width: ratio.width, height: ratio.height }}
                                                />
                                                <span className={`text-[10px] ${selectedRatio === ratio.id ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                    {ratio.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Atlas Cloud Resolution (1k/2k/4k or 720p/1080p) */}
                            {params.resolution && (
                                <div>
                                    <span className="text-gray-400 text-xs block mb-2">Resolution</span>
                                    <div className="flex gap-2">
                                        {params.resolution.options.map((res) => (
                                            <button
                                                key={res}
                                                onClick={() => setVideoResolution(res)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${videoResolution === res
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-[#141816] text-gray-400 border border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                {res}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size / Aspect Ratio Selector */}
                            {params.size && (
                                <div>
                                    <span className="text-gray-400 text-xs block mb-2">{params.size.options[0]?.includes('*') ? 'Size' : 'Aspect Ratio'}</span>
                                    <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
                                        {params.size.options.map((sz) => {
                                            const isPixelFormat = sz.includes('*');
                                            let label = sz;
                                            if (isPixelFormat) {
                                                const [w, h] = sz.split('*');
                                                label = w === h ? `${sz} (Square)` : Number(w) > Number(h) ? `${sz} (Landscape)` : `${sz} (Portrait)`;
                                            }
                                            return (
                                                <button
                                                    key={sz}
                                                    onClick={() => setVideoSize(sz)}
                                                    className={`flex-shrink-0 py-2 px-3 rounded-lg text-xs font-medium transition-all ${videoSize === sz
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-[#141816] text-gray-400 border border-white/5 hover:border-white/10'
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Duration */}
                            {params.duration && (
                                <div>
                                    <span className="text-gray-400 text-xs block mb-2">Duration (Seconds)</span>
                                    <div className="flex gap-2 flex-wrap">
                                        {params.duration.options.map((dur) => (
                                            <button
                                                key={dur}
                                                onClick={() => setVideoDuration(dur)}
                                                className={`flex-1 min-w-[40px] py-2 rounded-lg text-xs font-medium transition-all ${videoDuration === dur
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-[#141816] text-gray-400 border border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                {dur}s
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Image Quantity (CivitAI) */}
                            {params.quantity && (
                                <div>
                                    <span className="text-gray-400 text-xs block mb-2">Image Quantity</span>
                                    <div className="flex gap-2">
                                        {Array.from({ length: params.quantity.max }, (_, i) => i + 1).map((num) => (
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

                            {/* Free Creation Toggle - Only for CivitAI models */}
                            {isCivitaiModel(selectedModel.id) && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 group relative">
                                        <span className={`text-xs ${canUseFreeCreation ? 'text-gray-400' : 'text-gray-500'}`}>Free Creation</span>
                                        <Zap className={`w-3 h-3 ${canUseFreeCreation ? 'text-amber-400' : 'text-gray-500'}`} />
                                        {!canUseFreeCreation && (
                                            <Lock className="w-3 h-3 text-gray-500" />
                                        )}
                                        
                                        {/* Tooltip for locked users */}
                                        {!canUseFreeCreation && (
                                            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                <p className="text-xs text-gray-300">
                                                    🔒 Upgrade to <strong>Pro</strong> to unlock free generation
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Current: {currentTier || 'Free'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <Switch
                                        checked={freeCreation && canUseFreeCreation}
                                        onCheckedChange={(checked) => {
                                            if (canUseFreeCreation) {
                                                setFreeCreation(checked);
                                            }
                                        }}
                                        disabled={!canUseFreeCreation}
                                        className={`data-[state=checked]:bg-emerald-500 ${!canUseFreeCreation ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Advanced Config — CivitAI + Wan 2.6 advanced settings */}
                    {(params.steps || params.cfgScale || params.scheduler || params.clipSkip || params.seed || params.shotType || params.promptExpansion || params.generateAudio) && (
                        <div className="bg-[#1A1E1C] rounded-xl border border-white/5 overflow-hidden">
                            <button
                                onClick={() => setAdvancedOpen(!advancedOpen)}
                                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                            >
                                <span className="text-white text-sm">Advanced Config</span>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {advancedOpen && (
                                <div className="px-3 pb-3 space-y-4">

                                    {/* Shot Type — Wan 2.6 */}
                                    {params.shotType && (
                                        <div>
                                            <span className="text-gray-400 text-xs block mb-2">Shot Type</span>
                                            <div className="flex gap-2">
                                                {['single', 'multi'].map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            setShotType(type);
                                                            if (type === 'multi') setPromptExpansion(true);
                                                        }}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${shotType === type
                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                            : 'bg-[#141816] text-gray-400 border border-white/5 hover:border-white/10'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Prompt Expansion Toggle — Wan 2.6 */}
                                    {params.promptExpansion && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-400 text-xs">Prompt Expansion</span>
                                                <Info className="w-3 h-3 text-gray-600" />
                                            </div>
                                            <Switch
                                                checked={promptExpansion}
                                                onCheckedChange={setPromptExpansion}
                                                disabled={shotType === 'multi'}
                                                className="data-[state=checked]:bg-emerald-500"
                                            />
                                        </div>
                                    )}

                                    {/* Generate Audio Toggle — Wan 2.6 */}
                                    {params.generateAudio && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-xs">Generate Audio</span>
                                            <Switch
                                                checked={generateAudio}
                                                onCheckedChange={setGenerateAudio}
                                                className="data-[state=checked]:bg-emerald-500"
                                            />
                                        </div>
                                    )}
                                    {/* Steps */}
                                    {params.steps && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-gray-400 text-xs">Steps</span>
                                                <span className="text-gray-500 text-xs">{steps}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={params.steps.min}
                                                max={params.steps.max}
                                                value={steps}
                                                onChange={(e) => setSteps(Number(e.target.value))}
                                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                                <span>{params.steps.min}</span>
                                                <span>{params.steps.max}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* CFG Scale */}
                                    {params.cfgScale && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-gray-400 text-xs">CFG Scale</span>
                                                <span className="text-gray-500 text-xs">{cfgScale}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={params.cfgScale.min}
                                                max={params.cfgScale.max}
                                                value={cfgScale}
                                                onChange={(e) => setCfgScale(Number(e.target.value))}
                                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                                <span>{params.cfgScale.min}</span>
                                                <span>{params.cfgScale.max}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Scheduler */}
                                    {params.scheduler && (
                                        <div>
                                            <span className="text-gray-400 text-xs block mb-2">Scheduler / Sampler</span>
                                            <div className="relative">
                                                <select
                                                    value={scheduler}
                                                    onChange={(e) => setScheduler(e.target.value)}
                                                    className="w-full appearance-none bg-[#141816] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/30"
                                                >
                                                    {schedulerOptions.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Clip Skip */}
                                    {params.clipSkip && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-gray-400 text-xs">Clip Skip</span>
                                                <span className="text-gray-500 text-xs">{clipSkip}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={params.clipSkip.min}
                                                max={params.clipSkip.max}
                                                value={clipSkip}
                                                onChange={(e) => setClipSkip(Number(e.target.value))}
                                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                                <span>{params.clipSkip.min}</span>
                                                <span>{params.clipSkip.max}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Seed */}
                                    {params.seed && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-gray-400 text-xs">Seed</span>
                                                <button
                                                    onClick={() => setSeed(-1)}
                                                    className="text-gray-600 text-[10px] hover:text-emerald-400 transition-colors"
                                                >
                                                    Random
                                                </button>
                                            </div>
                                            <input
                                                type="number"
                                                value={seed}
                                                onChange={(e) => setSeed(Number(e.target.value))}
                                                placeholder="-1 for random"
                                                className="w-full bg-[#141816] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/30"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
