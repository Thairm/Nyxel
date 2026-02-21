import { useState, useEffect } from 'react';
import { X, Image, Video, Info, ChevronDown } from 'lucide-react';
import { imageModels, videoModels, hasVariants, type Model, type ModelVariant } from '@/data/modelData';

interface ModelSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (model: Model, variantId?: string) => void;
    initialMode: 'image' | 'video';
    selectedModelId?: number;
    selectedVariantId?: string;
}

export function ModelSelectorModal({
    isOpen,
    onClose,
    onSelect,
    initialMode,
    selectedModelId,
    selectedVariantId
}: ModelSelectorModalProps) {
    const [activeTab, setActiveTab] = useState<'image' | 'video'>(initialMode);
    const [expandedModelId, setExpandedModelId] = useState<number | null>(null);

    // Sync tab with initial mode when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialMode);
            setExpandedModelId(null);
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    const models = activeTab === 'video' ? videoModels : imageModels;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleModelSelect = (model: Model, variantId?: string) => {
        onSelect(model, variantId);
        onClose();
    };

    const handleModelClick = (model: Model) => {
        if (hasVariants(model)) {
            // Toggle expanded state for video models with variants
            setExpandedModelId(expandedModelId === model.id ? null : model.id);
        } else {
            // Direct selection for image models without variants
            handleModelSelect(model);
        }
    };

    const handleVariantSelect = (model: Model, variant: ModelVariant, e: React.MouseEvent) => {
        e.stopPropagation();
        handleModelSelect(model, variant.id);
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="bg-[#141816] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <h2 className="text-white text-lg font-semibold">Select Model</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Image/Video Toggle */}
                <div className="p-4 border-b border-white/5">
                    <div className="flex gap-1 bg-[#0D0F0E] rounded-lg p-1 w-fit">
                        <button
                            onClick={() => {
                                setActiveTab('image');
                                setExpandedModelId(null);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'image'
                                ? 'bg-[#1A1E1C] text-white'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Image className="w-4 h-4" />
                            Image Models ({imageModels.length})
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('video');
                                setExpandedModelId(null);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'video'
                                ? 'bg-[#1A1E1C] text-white'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Video className="w-4 h-4" />
                            Video Models ({videoModels.length})
                        </button>
                    </div>
                </div>

                {/* Model Grid */}
                <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)] scrollbar-thin">
                    <div className="grid grid-cols-4 gap-4">
                        {models.map((model) => (
                            <div key={model.id} className="relative">
                                <button
                                    onClick={() => handleModelClick(model)}
                                    className={`group relative overflow-hidden rounded-xl border transition-all duration-200 text-left w-full ${selectedModelId === model.id && !hasVariants(model)
                                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                                        : selectedModelId === model.id && hasVariants(model) && expandedModelId !== model.id
                                            ? 'border-emerald-500/50'
                                            : 'border-white/5 hover:border-emerald-500/50'
                                        }`}
                                >
                                    {/* Background Image */}
                                    <div className="aspect-[3/4] relative">
                                        <img
                                            src={model.image}
                                            alt={model.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F0E] via-[#0D0F0E]/50 to-transparent" />

                                        {/* Selected Indicator */}
                                        {selectedModelId === model.id && (
                                            <div className="absolute top-2 left-2">
                                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}

                                        {/* Badge */}
                                        {model.badge && (
                                            <div className="absolute top-2 right-2">
                                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${model.badge === 'NEW' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        model.badge === 'APP' ? 'bg-blue-500/20 text-blue-400' :
                                                            model.free ? 'bg-amber-500/20 text-amber-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {model.badge}
                                                </span>
                                            </div>
                                        )}

                                        {/* Expand Indicator for Video Models */}
                                        {hasVariants(model) && (
                                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                                                <div className={`w-6 h-6 rounded-full bg-white/10 flex items-center justify-center transition-transform ${expandedModelId === model.id ? 'rotate-180' : ''}`}>
                                                    <ChevronDown className="w-3 h-3 text-white" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Model Info */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className="text-gray-400 text-[10px] uppercase tracking-wide">
                                                    {hasVariants(model) ? `${model.variants?.length} Variants` : 'Model'}
                                                </span>
                                            </div>
                                            <h4 className="text-white font-medium text-sm truncate flex items-center gap-1">
                                                {model.name}
                                                <Info className="w-3 h-3 text-gray-500" />
                                            </h4>
                                            <p className="text-gray-500 text-xs">{model.version}</p>
                                            {model.description && (
                                                <p className="text-gray-600 text-[10px] mt-1 line-clamp-2">
                                                    {model.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hover Effect */}
                                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>

                                {/* Variant Selector Dropdown */}
                                {hasVariants(model) && expandedModelId === model.id && (
                                    <div className="absolute top-full left-0 right-0 mt-2 z-50">
                                        <div className="bg-[#1A1E1C] border border-emerald-500/30 rounded-xl overflow-hidden shadow-2xl">
                                            <div className="p-2 border-b border-white/5">
                                                <p className="text-gray-400 text-xs">Select Variant</p>
                                            </div>
                                            <div className="max-h-48 overflow-y-auto">
                                                {model.variants?.map((variant) => (
                                                <button
                                                    key={variant.id}
                                                    onClick={(e) => handleVariantSelect(model, variant, e)}
                                                    className={`w-full text-left p-3 transition-colors ${selectedModelId === model.id && selectedVariantId === variant.id
                                                                ? 'bg-emerald-500/20'
                                                                : 'hover:bg-white/5'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <p className={`text-sm font-medium ${selectedModelId === model.id && selectedVariantId === variant.id
                                                                        ? 'text-emerald-400'
                                                                        : 'text-white'
                                                                    }`}>
                                                                    {variant.name}
                                                                </p>
                                                                {variant.description && (
                                                                    <p className="text-gray-500 text-[10px] mt-0.5">
                                                                        {variant.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-emerald-400 text-xs font-medium">
                                                                    {variant.pricing}<span className="text-[10px] text-gray-500">/{variant.pricingUnit === 'per_sec' ? 'sec' : 'pic'}</span>
                                                                </p>
                                                                {selectedModelId === model.id && selectedVariantId === variant.id && (
                                                                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center mt-1 ml-auto">
                                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* Input Type Indicators */}
                                                        <div className="flex gap-1 mt-2">
                                                            {variant.supportedInputs.includes('text') && (
                                                                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] rounded">
                                                                    T2V
                                                                </span>
                                                            )}
                                                            {variant.supportedInputs.includes('image') && (
                                                                <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] rounded">
                                                                    I2V
                                                                </span>
                                                            )}
                                                            {variant.supportedInputs.includes('video') && (
                                                                <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] rounded">
                                                                    V2V
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
        </div>
    );
}
