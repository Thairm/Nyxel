// Credit cost definitions for each model and tier credit allocations
// Shared between webhook (credit allocation) and generate endpoints (credit deduction)

/**
 * Credit type and cost for each model ID.
 * Atlas Cloud models use Gems (premium), CivitAI models use Crystals (community).
 */
export const MODEL_COSTS: Record<number, { type: 'gems' | 'crystals'; cost: number }> = {
    // Atlas Cloud Image Models — Gems
    1: { type: 'gems', cost: 100 },   // Nano Banana Pro
    15: { type: 'gems', cost: 100 },   // Wan 2.6 Text-to-Image
    16: { type: 'gems', cost: 100 },   // Wan 2.6 Image Edit

    // CivitAI Image Models — Crystals
    6: { type: 'crystals', cost: 20 }, // Z Image Base
    7: { type: 'crystals', cost: 10 }, // WAI-illustrious-SDXL
    9: { type: 'crystals', cost: 10 }, // Hassaku XL Illustrious
    10: { type: 'crystals', cost: 10 }, // Prefect Illustrious XL
    11: { type: 'crystals', cost: 10 }, // NoobAI XL
    12: { type: 'crystals', cost: 10 }, // Illustrious XL
    13: { type: 'crystals', cost: 10 }, // Indigo Void Furry Fused XL
    14: { type: 'crystals', cost: 10 }, // BoytakuDream merge
};

/**
 * Video model costs are calculated per-second using the API pricing.
 * These are Gem costs (Atlas Cloud video models).
 * Cost = pricePerSecond × duration × gemsPerDollar
 * We use a simplified mapping: each video generation costs a flat Gem amount
 * based on the model, multiplied by duration.
 */
export const VIDEO_MODEL_COSTS_PER_SEC: Record<number, number> = {
    2: 15,  // Sora2              — $0.15/sec → 15 gems/sec
    3: 16,  // Veo3.1             — $0.16/sec → 16 gems/sec
    4: 7,   // Wan 2.6 Video      — $0.07/sec → 7 gems/sec
    5: 5,   // Wan 2.2            — $0.05/sec → 5 gems/sec
    8: 4,   // LTX-2 (fast)       — $0.04/sec → 4 gems/sec
};

/**
 * Monthly credit allocation per subscription tier.
 */
export const TIER_CREDITS: Record<string, { gems: number; crystals: number }> = {
    free: { gems: 100, crystals: 50 },
    starter: { gems: 1500, crystals: 500 },
    standard: { gems: 3000, crystals: 1000 },
    pro: { gems: 7000, crystals: 2000 },
    ultra: { gems: 11000, crystals: 3000 },
};

/**
 * Get the credit cost for an image generation.
 * Returns null if model not found.
 */
export function getImageCost(modelId: number): { type: 'gems' | 'crystals'; cost: number } | null {
    return MODEL_COSTS[modelId] || null;
}

/**
 * Get the credit cost for a video generation.
 * Cost = perSecondRate × duration (in seconds).
 * All video models use Gems.
 */
export function getVideoCost(modelId: number, durationSeconds: number): { type: 'gems'; cost: number } | null {
    const perSec = VIDEO_MODEL_COSTS_PER_SEC[modelId];
    if (perSec === undefined) return null;
    return { type: 'gems', cost: perSec * durationSeconds };
}

/**
 * Tier hierarchy for access control.
 * Higher number = higher tier.
 */
export const TIER_HIERARCHY: Record<string, number> = {
    free: 0, starter: 1, standard: 2, pro: 3, ultra: 4,
};

/**
 * Returns true only for Pro or Ultra subscribers.
 * Free Creation lets Pro/Ultra users generate CivitAI images without spending Crystals.
 */
export function canUseFreeCreation(userTier: string | null): boolean {
    const level = TIER_HIERARCHY[userTier ?? 'free'] ?? 0;
    return level >= TIER_HIERARCHY['pro'];
}
