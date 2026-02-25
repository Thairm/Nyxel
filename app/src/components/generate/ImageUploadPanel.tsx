import { useState, useRef, useCallback } from 'react';
import { Upload, X, ImagePlus, Plus } from 'lucide-react';
import type { ParamConfig } from '@/data/modelData';

export interface UploadedImage {
    id: string;
    base64: string;   // data URI: data:image/png;base64,...
    name: string;
    preview: string;   // same as base64 for display
}

interface ImageUploadPanelProps {
    config: NonNullable<ParamConfig['imageInput']>;
    images: UploadedImage[];
    onImagesChange: (images: UploadedImage[]) => void;
    lastImage: UploadedImage | null;
    onLastImageChange: (img: UploadedImage | null) => void;
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (Atlas Cloud limit)

export function ImageUploadPanel({
    config,
    images,
    onImagesChange,
    lastImage,
    onLastImageChange,
}: ImageUploadPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastFileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingLast, setIsDraggingLast] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = useCallback((file: File): string | null => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            return 'Only JPG, PNG, and WebP images are supported';
        }
        if (file.size > MAX_FILE_SIZE) {
            return 'Image must be under 50MB';
        }
        return null;
    }, []);

    const handleFiles = useCallback(async (files: FileList | File[], isLastImage = false) => {
        setError(null);

        for (const file of Array.from(files)) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }

            try {
                const base64 = await fileToBase64(file);
                const uploaded: UploadedImage = {
                    id: crypto.randomUUID(),
                    base64,
                    name: file.name,
                    preview: base64,
                };

                if (isLastImage) {
                    onLastImageChange(uploaded);
                } else {
                    if (images.length >= config.maxCount) {
                        // Replace the last one if at max
                        if (config.maxCount === 1) {
                            onImagesChange([uploaded]);
                        } else {
                            setError(`Maximum ${config.maxCount} images allowed`);
                        }
                        return;
                    }
                    onImagesChange([...images, uploaded]);
                }
            } catch {
                setError('Failed to read image file');
            }
        }
    }, [images, config.maxCount, onImagesChange, onLastImageChange, validateFile]);

    const handleDrop = useCallback((e: React.DragEvent, isLastImage = false) => {
        e.preventDefault();
        setIsDragging(false);
        setIsDraggingLast(false);
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files, isLastImage);
        }
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const removeImage = useCallback((id: string) => {
        onImagesChange(images.filter(img => img.id !== id));
    }, [images, onImagesChange]);

    const canAddMore = images.length < config.maxCount;

    return (
        <div className="space-y-3">
            {/* Section Label */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {config.label}
                    {config.required && <span className="text-red-400 ml-0.5">*</span>}
                </span>
                {config.maxCount > 1 && (
                    <span className="text-[10px] text-gray-500">
                        {images.length}/{config.maxCount}
                    </span>
                )}
            </div>

            {/* Upload Zone / Previews */}
            {images.length === 0 ? (
                /* Empty state — full drop zone */
                <div
                    onDrop={(e) => handleDrop(e)}
                    onDragOver={handleDragOver}
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative border-2 border-dashed rounded-xl p-6 cursor-pointer
                        flex flex-col items-center justify-center gap-2
                        transition-all duration-200
                        ${isDragging
                            ? 'border-emerald-400 bg-emerald-500/10'
                            : 'border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.02]'
                        }
                    `}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'
                        }`}>
                        <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-medium text-gray-300">
                            {isDragging ? 'Drop image here' : 'Click or drag image'}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                            JPG, PNG, WebP • Max 50MB
                        </p>
                    </div>
                </div>
            ) : (
                /* Has image(s) — show previews */
                <div className="space-y-2">
                    <div className={`grid gap-2 ${config.maxCount > 1 ? 'grid-cols-3' : 'grid-cols-1'}`}>
                        {images.map((img) => (
                            <div key={img.id} className="relative group rounded-lg overflow-hidden bg-black/30 border border-white/5">
                                <img
                                    src={img.preview}
                                    alt={img.name}
                                    className="w-full aspect-video object-cover"
                                />
                                <button
                                    onClick={() => removeImage(img.id)}
                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white/70 hover:text-white hover:bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                {config.maxCount === 1 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
                                        <p className="text-[10px] text-white/70 truncate">{img.name}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* Add more button for multi-image (Ref2V) */}
                        {canAddMore && config.maxCount > 1 && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-video rounded-lg border-2 border-dashed border-white/10 hover:border-emerald-500/30 flex items-center justify-center cursor-pointer transition-colors hover:bg-white/[0.02]"
                            >
                                <Plus className="w-5 h-5 text-gray-500" />
                            </div>
                        )}
                    </div>
                    {/* Replace button for single image */}
                    {config.maxCount === 1 && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-1.5 text-[10px] font-medium text-gray-400 hover:text-emerald-400 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                            <ImagePlus className="w-3 h-3" />
                            Replace Image
                        </button>
                    )}
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                multiple={config.maxCount > 1}
                onChange={(e) => {
                    if (e.target.files) handleFiles(e.target.files);
                    e.target.value = '';
                }}
                className="hidden"
            />

            {/* Last Frame Upload (Veo3.1 I2V only) */}
            {config.supportsLastImage && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Last Frame
                            <span className="text-gray-500 font-normal normal-case ml-1">(Optional)</span>
                        </span>
                    </div>

                    {!lastImage ? (
                        <div
                            onDrop={(e) => handleDrop(e, true)}
                            onDragOver={handleDragOver}
                            onDragEnter={() => setIsDraggingLast(true)}
                            onDragLeave={() => setIsDraggingLast(false)}
                            onClick={() => lastFileInputRef.current?.click()}
                            className={`
                                border-2 border-dashed rounded-xl p-4 cursor-pointer
                                flex flex-col items-center justify-center gap-1.5
                                transition-all duration-200
                                ${isDraggingLast
                                    ? 'border-purple-400 bg-purple-500/10'
                                    : 'border-white/10 hover:border-purple-500/30 hover:bg-white/[0.02]'
                                }
                            `}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDraggingLast ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400'
                                }`}>
                                <ImagePlus className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] text-gray-500">
                                End frame for interpolation
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="relative group rounded-lg overflow-hidden bg-black/30 border border-white/5">
                                <img
                                    src={lastImage.preview}
                                    alt="Last frame"
                                    className="w-full aspect-video object-cover"
                                />
                                <button
                                    onClick={() => onLastImageChange(null)}
                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white/70 hover:text-white hover:bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
                                    <p className="text-[10px] text-white/70 truncate">{lastImage.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => lastFileInputRef.current?.click()}
                                className="w-full py-1.5 text-[10px] font-medium text-gray-400 hover:text-purple-400 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                                <ImagePlus className="w-3 h-3" />
                                Replace Last Frame
                            </button>
                        </div>
                    )}

                    <input
                        ref={lastFileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={(e) => {
                            if (e.target.files) handleFiles(e.target.files, true);
                            e.target.value = '';
                        }}
                        className="hidden"
                    />
                </div>
            )}

            {/* Error message */}
            {error && (
                <p className="text-[10px] text-red-400 mt-1">{error}</p>
            )}
        </div>
    );
}
