// Shared model data for use across the application
// Each model can have flexible properties that control what's displayed

export interface Model {
    id: number;
    name: string;
    version: string;
    type: 'image' | 'video';
    category: string;  // e.g., "Image Generation", "AI App", "AI Model"
    image: string;
    // Flexible per-model properties:
    free?: boolean;       // Shows "Free" badge if true
    badge?: string;       // Custom badge text (e.g., "Checkpoint", "APP", "NEW", "PRO")
    featured?: boolean;   // Highlight in listings
    description?: string; // Optional description
    rating?: number;      // Optional rating (for hub page)
}

// Image generation models
export const imageModels: Model[] = [
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
        rating: 4.8
    },
    {
        id: 6,
        name: 'Z Image',
        version: 'v1.0',
        type: 'image',
        category: 'AI Model',
        image: '/model-zimage.png',
        free: true,
        badge: 'NEW',
        rating: 4.9
    },
    {
        id: 7,
        name: 'WAINSFWIllustrious',
        version: 'v1.0',
        type: 'image',
        category: 'AI Model',
        image: '/model-wainsfwillustrious.png',
        badge: 'Checkpoint',
        rating: 4.8
    },
];

// Video generation models
export const videoModels: Model[] = [
    {
        id: 2,
        name: 'Sora2',
        version: 'v2.1',
        type: 'video',
        category: 'AI App',
        image: '/model-2.jpg',
        free: true,
        badge: 'APP',
        rating: 4.6
    },
    {
        id: 3,
        name: 'Veo3.1',
        version: 'v3.1',
        type: 'video',
        category: 'AI Model',
        image: '/model-3.jpg',
        badge: 'Checkpoint',
        rating: 5.0
    },
    {
        id: 4,
        name: 'Wan 2.6',
        version: 'v2.6',
        type: 'video',
        category: 'AI Model',
        image: '/model-4.jpg',
        free: true,
        badge: 'Checkpoint',
        rating: 4.7
    },
    {
        id: 5,
        name: 'Wan2.2',
        version: 'v2.2',
        type: 'video',
        category: 'AI Model',
        image: '/model-5.jpg',
        badge: 'Checkpoint',
        rating: 4.9
    },
    {
        id: 8,
        name: 'Ltx2',
        version: 'v2.0',
        type: 'video',
        category: 'AI Model',
        image: '/model-ltx2.png',
        badge: 'NEW',
        rating: 4.7
    },
];

// Get all models
export const allModels = [...imageModels, ...videoModels];

// Helper to get default model for a mode
export function getDefaultModel(mode: 'image' | 'video'): Model {
    return mode === 'video' ? videoModels[0] : imageModels[0];
}

// Helper to format models for Hub page display (compatible with existing ModelCard)
// This returns ALL models (both image and video) for the hub page
export function getHubModels() {
    return allModels.map(model => ({
        id: model.id,
        name: model.name,
        type: model.category,
        rating: model.rating || 0,
        image: model.image,
        badge: model.badge || '',
        free: model.free || false
    }));
}
