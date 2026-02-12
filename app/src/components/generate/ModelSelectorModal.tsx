import { useState, useEffect } from 'react';
import { X, Image, Video, Info } from 'lucide-react';
import { imageModels, videoModels } from '@/data/modelData';
import type { Model } from '@/data/modelData';

interface ModelSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (model: Model) => void;
    initialMode: 'image' | 'video';
    selectedModelId?: number;
}

export function ModelSelectorModal({
    isOpen,
    onClose,
    onSelect,
    initialMode,
    selectedModelId
}: ModelSelectorModalProps) {
    const [activeTab, setActiveTab] = useState<'image' | 'video'>(initialMode);

    // Sync tab with initial mode when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialMode);
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    const models = activeTab === 'video' ? videoModels : imageModels;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleModelSelect = (model: Model) => {
        onSelect(model);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="bg-[#141816] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl animate-scale-in">
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
                            onClick={() => setActiveTab('image')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'image'
                                ? 'bg-[#1A1E1C] text-white'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Image className="w-4 h-4" />
                            Image Models
                        </button>
                        <button
                            onClick={() => setActiveTab('video')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'video'
                                ? 'bg-[#1A1E1C] text-white'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Video className="w-4 h-4" />
                            Video Models
                        </button>
                    </div>
                </div>

                {/* Model Grid */}
                <div className="p-4 overflow-y-auto max-h-[calc(80vh-140px)] scrollbar-thin">
                    <div className="grid grid-cols-4 gap-4">
                        {models.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => handleModelSelect(model)}
                                className={`group relative overflow-hidden rounded-xl border transition-all duration-200 text-left ${selectedModelId === model.id
                                    ? 'border-emerald-500 ring-2 ring-emerald-500/30'
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

                                    {/* Model Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="text-gray-400 text-[10px] uppercase tracking-wide">Model</span>
                                        </div>
                                        <h4 className="text-white font-medium text-sm truncate flex items-center gap-1">
                                            {model.name}
                                            <Info className="w-3 h-3 text-gray-500" />
                                        </h4>
                                        <p className="text-gray-500 text-xs">{model.version}</p>
                                    </div>
                                </div>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
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
