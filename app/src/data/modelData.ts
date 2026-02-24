// Shared model data for use across the application
// Updated with Atlas Cloud and Civitai model integrations

// Per-model parameter configuration — drives the dynamic settings UI
export interface ParamConfig {
    aspectRatio?: boolean;               // Show ratio picker
    resolution?: {                       // Atlas Cloud resolution presets
        options: string[];
        default: string;
    };
    size?: {                             // Pixel size selector (e.g. Sora2)
        options: string[];               // e.g. ['1280*720', '720*1280']
        default: string;
    };
    widthHeight?: boolean;               // CivitAI custom width/height (derived from ratio)
    duration?: {
        options: number[];
        default: number;
    };
    quantity?: {
        max: number;
        default: number;
    };
    negativePrompt?: boolean;
    seed?: boolean;
    steps?: { min: number; max: number; default: number };
    cfgScale?: { min: number; max: number; default: number };
    scheduler?: boolean;
    clipSkip?: { min: number; max: number; default: number };
    generateAudio?: boolean;
    promptExpansion?: boolean;
    shotType?: boolean;
    loras?: boolean;
}

export interface ModelVariant {
    id: string;
    name: string;
    apiModelName?: string;
    civitaiUrn?: string;
    supportedInputs: ('text' | 'image' | 'video')[];
    description?: string;
    pricing: string;
    pricingUnit?: 'per_sec' | 'per_pic';
    supportedParams?: ParamConfig;       // Variant-level param overrides
}

export interface Model {
    id: number;
    name: string;
    version: string;
    type: 'image' | 'video';
    category: string;
    image: string;
    free?: boolean;
    badge?: string;
    featured?: boolean;
    description?: string;
    rating?: number;
    // Variant support for video models
    variants?: ModelVariant[];
    defaultVariant?: string;
    supportedParams?: ParamConfig;       // Model-level defaults
}

// ============================================
// IMAGE GENERATION MODELS (11 total)
// ============================================

export const imageModels: Model[] = [
    // Atlas Cloud Image Models
    {
        id: 1,
        name: 'Nano Banana Pro',
        version: 'v1.0',
        type: 'image',
        category: 'Image Generation',
        image: '/model-1.jpg',
        free: true,
        badge: 'Checkpoint',
        featured: true,
        rating: 4.8,
        description: 'Google\'s next-generation image model with superior text rendering and character consistency',
        supportedParams: {
            aspectRatio: true,
            resolution: { options: ['1k', '2k', '4k'], default: '1k' },
        },
    },
    {
        id: 15,
        name: 'Wan 2.6 Text-to-Image',
        version: 'v2.6',
        type: 'image',
        category: 'Image Generation',
        image: '/model-wan26-t2i.jpg',
        badge: 'NEW',
        rating: 4.7,
        description: 'Alibaba\'s advanced text-to-image model with multiple artistic styles',
        supportedParams: {
            aspectRatio: true,
            negativePrompt: true,
            seed: true,
        },
    },
    {
        id: 16,
        name: 'Wan 2.6 Image Edit',
        version: 'v2.6',
        type: 'image',
        category: 'Image Editing',
        image: '/model-wan26-edit.jpg',
        badge: 'NEW',
        rating: 4.6,
        description: 'Edit existing images with text prompts while preserving structure',
        supportedParams: {
            aspectRatio: true,
            negativePrompt: true,
            seed: true,
        },
    },
    // Civitai Image Models
    {
        id: 6,
        name: 'Z Image Base',
        version: 'v1.0',
        type: 'image',
        category: 'AI Model',
        image: '/model-zimage.png',
        free: true,
        badge: 'NEW',
        rating: 4.9,
        description: 'Alibaba\'s 6B parameter standalone image model',
        supportedParams: {
            aspectRatio: true,
            widthHeight: true,
            quantity: { max: 4, default: 4 },
            negativePrompt: true,
            seed: true,
            steps: { min: 1, max: 50, default: 30 },
            cfgScale: { min: 1, max: 30, default: 7 },
            scheduler: true,
            clipSkip: { min: 1, max: 3, default: 2 },
        },
    },
    {
        id: 7,
        name: 'WAI-illustrious-SDXL',
        version: 'v1.0',
        type: 'image',
        category: 'AI Model',
        image: '/model-wainsfwillustrious.png',
        badge: 'Checkpoint',
        rating: 4.8,
        description: 'Illustrious-based SDXL model for high-quality image generation',
        supportedParams: {
            aspectRatio: true,
            widthHeight: true,
            quantity: { max: 4, default: 4 },
            negativePrompt: true,
            seed: true,
            steps: { min: 1, max: 50, default: 30 },
            cfgScale: { min: 1, max: 30, default: 7 },
            scheduler: true,
            clipSkip: { min: 1, max: 3, default: 2 },
        },
    },
    {
        id: 9,
        name: 'Hassaku XL Illustrious',
        version: 'v1.0',
        type: 'image',
        category: 'AI Model',
        image: '/model-hassaku.jpg',
        badge: 'Checkpoint',
        rating: 4.7,
        description: 'Illustrious-based model with excellent anime and artistic styles',
        supportedParams: {
            aspectRatio: true,
            widthHeight: true,
            quantity: { max: 4, default: 4 },
            negativePrompt: true,
            seed: true,
            steps: { min: 1, max: 50, default: 30 },
            cfgScale: { min: 1, max: 30, default: 7 },
            scheduler: true,
            clipSkip: { min: 1, max: 3, default: 2 },
        },
    },
    {
        id: 10,
        name: 'Prefect Illustrious XL',
        version: 'v1.0',
        type: 'image',
        category: 'AI Model',
        image: '/model-prefect.jpg',
        badge: 'Checkpoint',
        rating: 4.8,
        description: 'High-quality Illustrious-based model with refined outputs',
        supportedParams: {
            aspectRatio: true,
            widthHeight: true,
            quantity: { max: 4, default: 4 },
            negativePrompt: true,
            seed: true,
            steps: { min: 1, max: 50, default: 30 },
            cfgScale: { min: 1, max: 30, default: 7 },
            scheduler: true,
            clipSkip: { min: 1, max: 3, default: 2 },
        },
    },
    {
        id: 11,
        name: 'NoobAI XL',
        version: 'v1.0',
        type: 'image',
        category: 'AI Model',
        image: '/model-noobai.jpg',
        badge: 'Checkpoint',
        rating: 4.6,
        description: 'Pony-based SDXL model for diverse artistic styles',
        supportedParams: {
            aspectRatio: true,
            widthHeight: true,
            quantity: { max: 4, default: 4 },
            negativePrompt: true,
            seed: true,
            steps: { min: 1, max: 50, default: 30 },
            cfgScale: { min: 1, max: 30, default: 7 },
            scheduler: true,
            clipSkip: { min: 1, max: 3, default: 2 },
        },
    },
    {
        id: 12,
        name: 'Illustrious XL',
        version: 'v1.0',
        type: 'image',
        category: 'AI Model',
        image: '/model-illustrious.jpg',
        badge: 'Checkpoint',
        rating: 4.9,
        description: 'Base Illustrious SDXL model for professional image generation',
        supportedParams: {
            aspectRatio: true,
            widthHeight: true,
            quantity: { max: 4, default: 4 },
            negativePrompt: true,
            seed: true,
            steps: { min: 1, max: 50, default: 30 },
            cfgScale: { min: 1, max: 30, default: 7 },
            scheduler: true,
            clipSkip: { min: 1, max: 3, default: 2 },
        },
    },
    {
        id: 13,
        name: 'Indigo Void Furry Fused XL',
        version: 'v1.0',
        type: 'image',
        category: 'AI Model',
        image: '/model-indigo.jpg',
        badge: 'NEW',
        rating: 4.5,
        description: 'NoobAI-based model specialized for furry and anthropomorphic art',
        supportedParams: {
            aspectRatio: true,
            widthHeight: true,
            quantity: { max: 4, default: 4 },
            negativePrompt: true,
            seed: true,
            steps: { min: 1, max: 50, default: 30 },
            cfgScale: { min: 1, max: 30, default: 7 },
            scheduler: true,
            clipSkip: { min: 1, max: 3, default: 2 },
        },
    },
    {
        id: 14,
        name: 'BoytakuDream merge',
        version: 'v1.0',
        type: 'image',
        category: 'AI Model',
        image: '/model-boytaku.jpg',
        badge: 'Checkpoint',
        rating: 4.7,
        description: 'Illustrious-based merged model with unique artistic style',
        supportedParams: {
            aspectRatio: true,
            widthHeight: true,
            quantity: { max: 4, default: 4 },
            negativePrompt: true,
            seed: true,
            steps: { min: 1, max: 50, default: 30 },
            cfgScale: { min: 1, max: 30, default: 7 },
            scheduler: true,
            clipSkip: { min: 1, max: 3, default: 2 },
        },
    },
];

// ============================================
// VIDEO GENERATION MODELS (5 base models, 15 variants)
// ============================================

export const videoModels: Model[] = [
    // Sora2 - 2 variants
    {
        id: 2,
        name: 'Sora2',
        version: 'v2.1',
        type: 'video',
        category: 'AI App',
        image: '/model-2.jpg',
        free: true,
        badge: 'APP',
        featured: true,
        rating: 4.6,
        description: 'OpenAI\'s physics-accurate video generation with synchronized audio',
        variants: [
            {
                id: 't2v',
                name: 'Text-to-Video',
                apiModelName: 'openai/sora-2/text-to-video-pro-developer',
                supportedInputs: ['text'],
                description: 'Generate videos from text prompts with physics-accurate motion',
                pricing: '$0.15',
                pricingUnit: 'per_sec',
                supportedParams: {
                    size: { options: ['1280*720', '720*1280'], default: '1280*720' },
                    duration: { options: [10, 15, 25], default: 10 },
                },
            },
            {
                id: 'i2v',
                name: 'Image-to-Video',
                apiModelName: 'openai/sora-2/image-to-video-pro-developer',
                supportedInputs: ['text', 'image'],
                description: 'Transform images into videos with motion and audio',
                pricing: '$0.15',
                pricingUnit: 'per_sec',
                supportedParams: {
                    size: { options: ['1280*720', '720*1280'], default: '1280*720' },
                    duration: { options: [10, 15, 25], default: 10 },
                },
            }
        ],
        defaultVariant: 't2v'
    },
    // Veo3.1 - 4 variants
    {
        id: 3,
        name: 'Veo3.1',
        version: 'v3.1',
        type: 'video',
        category: 'AI Model',
        image: '/model-3.jpg',
        badge: 'Checkpoint',
        rating: 5.0,
        description: 'Google\'s advanced video model with temporal consistency',
        variants: [
            {
                id: 't2v',
                name: 'Text-to-Video',
                apiModelName: 'google/veo3.1/text-to-video',
                supportedInputs: ['text'],
                description: 'Generate 4-8s videos from text with audio',
                pricing: '$0.16',
                pricingUnit: 'per_sec',
                supportedParams: {
                    size: { options: ['16:9', '9:16'], default: '16:9' },
                    duration: { options: [4, 6, 8], default: 4 },
                    resolution: { options: ['720p', '1080p'], default: '1080p' },
                    generateAudio: true,
                    negativePrompt: true,
                    seed: true,
                },
            },
            {
                id: 'ref2v',
                name: 'Reference-to-Video',
                apiModelName: 'google/veo3.1/reference-to-video',
                supportedInputs: ['text', 'image'],
                description: 'Use 1-3 reference images for character consistency',
                pricing: '$0.16',
                pricingUnit: 'per_sec',
                supportedParams: {
                    resolution: { options: ['720p', '1080p'], default: '1080p' },
                    generateAudio: true,
                    negativePrompt: true,
                    seed: true,
                },
            },
            {
                id: 'i2v',
                name: 'Image-to-Video',
                apiModelName: 'google/veo3.1/image-to-video',
                supportedInputs: ['text', 'image'],
                description: 'Animate images into videos with camera motion',
                pricing: '$0.16',
                pricingUnit: 'per_sec',
                supportedParams: {
                    size: { options: ['16:9', '9:16'], default: '16:9' },
                    duration: { options: [4, 6, 8], default: 4 },
                    resolution: { options: ['720p', '1080p'], default: '1080p' },
                    generateAudio: true,
                    negativePrompt: true,
                    seed: true,
                },
            },
            {
                id: 'fast-i2v',
                name: 'Fast Image-to-Video',
                apiModelName: 'google/veo3.1-fast/image-to-video',
                supportedInputs: ['text', 'image'],
                description: 'Faster I2V generation at lower cost',
                pricing: '$0.08',
                pricingUnit: 'per_sec',
                supportedParams: {
                    size: { options: ['16:9', '9:16'], default: '16:9' },
                    duration: { options: [4, 6, 8], default: 4 },
                    resolution: { options: ['720p', '1080p'], default: '1080p' },
                    generateAudio: true,
                    negativePrompt: true,
                    seed: true,
                },
            }
        ],
        defaultVariant: 't2v'
    },
    // Wan 2.6 Video - 3 variants (NOTE: different from Wan 2.6 Image models)
    {
        id: 4,
        name: 'Wan 2.6 Video',
        version: 'v2.6',
        type: 'video',
        category: 'AI Model',
        image: '/model-4.jpg',
        free: true,
        badge: 'Checkpoint',
        rating: 4.7,
        description: 'Alibaba\'s multi-shot video generation up to 15 seconds',
        variants: [
            {
                id: 't2v',
                name: 'Text-to-Video',
                apiModelName: 'alibaba/wan-2.6/text-to-video',
                supportedInputs: ['text'],
                description: 'Generate 5-15s videos with multi-shot storytelling',
                pricing: '$0.07',
                pricingUnit: 'per_sec',
                supportedParams: {
                    size: { options: ['1280*720', '720*1280', '960*960', '1088*832', '832*1088'], default: '1280*720' },
                    duration: { options: [5, 10, 15], default: 5 },
                    generateAudio: true,
                    promptExpansion: true,
                    shotType: true,
                    negativePrompt: true,
                    seed: true,
                },
            },
            {
                id: 'i2v',
                name: 'Image-to-Video',
                apiModelName: 'alibaba/wan-2.6/image-to-video',
                supportedInputs: ['text', 'image'],
                description: 'Transform images into motion videos',
                pricing: '$0.07',
                pricingUnit: 'per_sec',
                supportedParams: {
                    duration: { options: [5, 10, 15], default: 5 },
                    resolution: { options: ['720p', '1080p'], default: '720p' },
                    generateAudio: true,
                    promptExpansion: true,
                    shotType: true,
                    negativePrompt: true,
                    seed: true,
                },
            },
            {
                id: 'flash-i2v',
                name: 'Image-to-Video Flash',
                apiModelName: 'alibaba/wan-2.6/image-to-video-flash',
                supportedInputs: ['text', 'image'],
                description: 'Faster and more cost-effective I2V (30% off)',
                pricing: '$0.018',
                pricingUnit: 'per_sec',
                supportedParams: {
                    duration: { options: [5, 10, 15], default: 5 },
                    resolution: { options: ['720p', '1080p'], default: '720p' },
                    generateAudio: true,
                    promptExpansion: true,
                    shotType: true,
                    negativePrompt: true,
                    seed: true,
                },
            }
        ],
        defaultVariant: 't2v'
    },
    // Wan 2.2 - 2 variants
    {
        id: 5,
        name: 'Wan 2.2',
        version: 'v2.2',
        type: 'video',
        category: 'AI Model',
        image: '/model-5.jpg',
        badge: 'Checkpoint',
        rating: 4.9,
        description: '5B parameter model with cinematic-level aesthetic control',
        variants: [
            {
                id: 't2v',
                name: 'Text-to-Video 720p',
                apiModelName: 'alibaba/wan-2.2/t2v-5b-720p',
                supportedInputs: ['text'],
                description: '720p video generation from text prompts',
                pricing: '$0.05',
                pricingUnit: 'per_sec',
                supportedParams: {
                    size: { options: ['1280*720', '720*1280'], default: '1280*720' },
                    seed: true,
                },
            },
            {
                id: 'i2v',
                name: 'Image-to-Video 720p',
                apiModelName: 'alibaba/wan-2.2/i2v-5b-720p',
                supportedInputs: ['text', 'image'],
                description: '720p I2V — output adapts to input image',
                pricing: '$0.05',
                pricingUnit: 'per_sec',
                supportedParams: {
                    seed: true,
                },
            }
        ],
        defaultVariant: 't2v'
    },
    // LTX-2 - 4 variants
    {
        id: 8,
        name: 'LTX-2',
        version: 'v2.0',
        type: 'video',
        category: 'AI Model',
        image: '/model-ltx2.png',
        badge: 'NEW',
        rating: 4.7,
        description: 'Lightricks\' cinematic video engine with A/V sync',
        variants: [
            {
                id: 'fast-t2v',
                name: 'Fast Text-to-Video',
                apiModelName: 'lightricks/ltx-2-fast/text-to-video',
                supportedInputs: ['text'],
                description: 'Ultra-fast generation up to 20 seconds',
                pricing: '$0.04',
                pricingUnit: 'per_sec',
                supportedParams: {
                    duration: { options: [6, 8, 10, 12, 14, 16, 18, 20], default: 6 },
                },
            },
            {
                id: 'fast-i2v',
                name: 'Fast Image-to-Video',
                apiModelName: 'lightricks/ltx-2-fast/image-to-video',
                supportedInputs: ['text', 'image'],
                description: 'Animate images quickly up to 20s',
                pricing: '$0.04',
                pricingUnit: 'per_sec',
                supportedParams: {
                    duration: { options: [6, 8, 10, 12, 14, 16, 18, 20], default: 6 },
                },
            },
            {
                id: 'pro-t2v',
                name: 'Pro Text-to-Video',
                apiModelName: 'lightricks/ltx-2-pro/text-to-video',
                supportedInputs: ['text'],
                description: 'Higher quality 6-10s videos with precise control',
                pricing: '$0.06',
                pricingUnit: 'per_sec',
                supportedParams: {
                    duration: { options: [6, 8, 10], default: 6 },
                },
            },
            {
                id: 'pro-i2v',
                name: 'Pro Image-to-Video',
                apiModelName: 'lightricks/ltx-2-pro/image-to-video',
                supportedInputs: ['text', 'image'],
                description: 'Professional-grade I2V with superior consistency',
                pricing: '$0.06',
                pricingUnit: 'per_sec',
                supportedParams: {
                    duration: { options: [6, 8, 10], default: 6 },
                },
            }
        ],
        defaultVariant: 'fast-t2v'
    },
];

// Get all models
export const allModels = [...imageModels, ...videoModels];

// Helper to get default model for a mode
export function getDefaultModel(mode: 'image' | 'video'): Model {
    return mode === 'video' ? videoModels[0] : imageModels[0];
}

// Helper to get model by ID
export function getModelById(id: number): Model | undefined {
    return allModels.find(model => model.id === id);
}

// Helper to check if model has variants
export function hasVariants(model: Model): boolean {
    return model.variants !== undefined && model.variants.length > 0;
}

// Helper to get variant by ID
export function getVariantById(model: Model, variantId: string): ModelVariant | undefined {
    return model.variants?.find(v => v.id === variantId);
}

// Helper to format models for Hub page display
export function getHubModels() {
    return allModels.map(model => ({
        id: model.id,
        name: model.name,
        type: model.category,
        rating: model.rating || 0,
        image: model.image,
        badge: model.badge || '',
        free: model.free || false,
        description: model.description || ''
    }));
}

// Helper to check if model supports image input
export function supportsImageInput(model: Model, variantId?: string): boolean {
    if (!hasVariants(model)) {
        // For image models, check if it's Wan 2.6 Image Edit (ID 16)
        return model.id === 16; // Only Image Edit requires image input
    }

    // For video models, check the variant
    const variant = variantId ? getVariantById(model, variantId) : model.variants?.[0];
    return variant?.supportedInputs.includes('image') || false;
}

// Helper to check if model requires image input
export function requiresImageInput(model: Model, variantId?: string): boolean {
    if (model.id === 16) return true; // Wan 2.6 Image Edit always requires image

    if (!hasVariants(model)) return false;

    const variant = variantId ? getVariantById(model, variantId) : model.variants?.[0];
    if (!variant) return false;

    // Check if it's I2V or Ref2V variant (requires image)
    return variant.id.includes('i2v') || variant.id.includes('ref');
}

// Helper to get effective params — variant overrides model-level defaults
export function getEffectiveParams(model: Model, variantId?: string): ParamConfig {
    if (hasVariants(model) && variantId) {
        const variant = getVariantById(model, variantId);
        if (variant?.supportedParams) return variant.supportedParams;
    }
    return model.supportedParams || {};
}
