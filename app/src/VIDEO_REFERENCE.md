# Video Generation — Removed Frontend Code Reference

This file contains all the video-related frontend code that was removed when the platform
switched to image-only generation. Use this as a reference when re-implementing video generation.

**Date removed:** February 2026
**Reason:** Video generation costs too high for initial launch
**Backend status:** Video backend is STILL INTACT — no backend changes needed

---

## Backend Files Still Intact (DO NOT recreate — they already exist)

- `functions/api/generate/video.ts` — Video generation endpoint (Atlas Cloud video models)
- `functions/api/generate/status.ts` — Async job polling (used by CivitAI and video jobs)
- `app/src/data/modelData.ts` — Video model definitions (IDs 2-5, 8) still exported as `videoModels`
- `functions/lib/credit-costs.ts` — Video cost calculations still present

---

## 1. ModelSelectorModal.tsx — Video Tab Toggle

**File:** `app/src/components/generate/ModelSelectorModal.tsx`

The modal used to have Image/Video tab switching. Here's what was removed:

### Imports (add back)
```tsx
import { useState, useEffect } from 'react';
import { X, Image, Video, Info } from 'lucide-react';
import { imageModels, videoModels, type Model } from '@/data/modelData';
```

### Props (add `initialMode` back)
```tsx
interface ModelSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (model: Model, variantId?: string) => void;
    initialMode: 'image' | 'video';  // <-- ADD THIS BACK
    selectedModelId?: number;
    selectedVariantId?: string;
}
```

### State and tab sync (add inside component)
```tsx
const [activeTab, setActiveTab] = useState<'image' | 'video'>(initialMode);

// Sync tab with initial mode when modal opens
useEffect(() => {
    if (isOpen) {
        setActiveTab(initialMode);
    }
}, [isOpen, initialMode]);
```

### Model selection (restore conditional)
```tsx
const models = activeTab === 'video' ? videoModels : imageModels;
```

### Tab Toggle UI (insert after the header, before the grid)
```tsx
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
            Image Models ({imageModels.length})
        </button>
        <button
            onClick={() => setActiveTab('video')}
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
```

---

## 2. SettingsPanel.tsx — Video Mode Logic

**File:** `app/src/components/generate/SettingsPanel.tsx`

### Props (add `mode` back to interface)
```tsx
interface SettingsPanelProps {
    mode: string;  // <-- ADD THIS BACK ('image' or 'video')
    // ... rest of props
}
```

### Video mode variable (add inside component function)
```tsx
const isVideoMode = mode === 'video';
```

### Pass initialMode to ModelSelectorModal
```tsx
<ModelSelectorModal
    isOpen={showModelModal}
    onClose={() => setShowModelModal(false)}
    onSelect={handleModelSelect}
    initialMode={isVideoMode ? 'video' : 'image'}  // <-- ADD THIS BACK
    selectedModelId={selectedModel.id}
    selectedVariantId={selectedVariantId}
/>
```

### Conditional labels using isVideoMode
```tsx
{/* Aspect ratio label changes based on mode */}
<span className="text-gray-400 text-xs">
    {isVideoMode ? 'Aspect Ratio' : 'Image Settings'}
</span>

{/* Quantity only shown for images, not video */}
{params.quantity && !isVideoMode && (
    <div>
        <span className="text-gray-400 text-xs block mb-2">Image Quantity</span>
        {/* ... quantity buttons */}
    </div>
)}
```

---

## 3. GeneratePage.tsx — Video Navigation, Mode Switching, and API Calls

**File:** `app/src/pages/GeneratePage.tsx`

### Imports (add back)
```tsx
import { Video } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
```

### Navigation items (add Video back to array)
```tsx
const navItems = [
    { icon: Image, label: 'Image', path: '/generate/image' },
    { icon: Video, label: 'Video', path: '/generate/video' },  // <-- ADD BACK
    { icon: AppWindow, label: 'AI App', path: '#' },
    { icon: Bot, label: 'Agent', path: '#' },
    { icon: Users, label: 'Character', path: '#' },
    { icon: Volume2, label: 'Audio', path: '#' },
    { icon: MoreHorizontal, label: 'More', path: '#' },
];
```

### Mode detection from URL (add inside component)
```tsx
const { mode } = useParams<{ mode: string }>();
const isVideoMode = mode === 'video';
```

### Auto-switch model when navigating between modes
```tsx
useEffect(() => {
    const targetType = mode === 'video' ? 'video' : 'image';
    if (selectedModel.type !== targetType) {
        const defaultModel = getDefaultModel(targetType);
        setSelectedModel(defaultModel);
        setSelectedVariantId(defaultModel.defaultVariant);
        setUploadedImages([]);
        setLastImage(null);
    }
}, [mode]);
```

### Default model selection based on mode
```tsx
const [selectedModel, setSelectedModel] = useState<Model>(
    getDefaultModel(mode === 'video' ? 'video' : 'image')
);
```

### handleGenerate — endpoint and body differ for video
```tsx
const endpoint = mode === 'video' ? '/api/generate/video' : '/api/generate/image';
const mediaType = mode === 'video' ? 'video' : 'image';

const requestBody: any = {
    modelId: selectedModel.id,
    prompt,
    userId: user?.id || null,
    quantity: mode === 'video' ? 1 : imageQuantity,
    params: {
        ratio: selectedRatio,
        aspect_ratio: selectedRatio,
        ...(mode === 'video' ? { duration: videoDuration } : {}),
        ...(videoResolution ? { resolution: videoResolution } : {}),
        ...(negativePrompt ? { negativePrompt } : {}),
        ...(seed !== -1 ? { seed } : {}),
        steps,
        cfgScale,
        scheduler,
        clipSkip,
        ...(videoSize ? { size: videoSize } : {}),
        shot_type: shotType,
        enable_prompt_expansion: promptExpansion,
        generate_audio: generateAudio,
        ...(uploadedImages.length === 1 ? { image: uploadedImages[0].base64 } : {}),
        ...(uploadedImages.length > 1 ? { images: uploadedImages.map(img => img.base64) } : {}),
        ...(lastImage ? { last_image: lastImage.base64 } : {}),
    }
};

if (mode === 'video' && selectedVariantId) {
    requestBody.variantId = selectedVariantId;
}
```

### Sidebar nav active state (use isVideoMode)
```tsx
{navItems.map((item) => {
    const isActive = (isVideoMode && item.label === 'Video') || (!isVideoMode && item.label === 'Image');
    // ...
})}
```

### Pass mode to SettingsPanel
```tsx
<SettingsPanel
    mode={mode || 'image'}  // <-- ADD THIS BACK
    // ... rest of props
/>
```

### Route setup (in your router config)
Make sure the route accepts the mode parameter:
```tsx
<Route path="/generate/:mode" element={<GeneratePage />} />
```

---

## 4. Sidebar.tsx — Video Nav Link

**File:** `app/src/components/layout/Sidebar.tsx`

### Import (add back)
```tsx
import { Video } from 'lucide-react';
```

### Nav item (add back to navItems array)
```tsx
{ icon: Video, label: 'AI Video', path: '/generate/video' },
```

### Active state check (add back in the nav loop)
```tsx
(item.path === '/generate/video' && location.pathname.startsWith('/generate/video'));
```

---

## 5. HomePage.tsx — Video Generation Feature Card

**File:** `app/src/pages/HomePage.tsx`

### Feature card (replace the Unlimited Generation card back to this)
```tsx
{
    title: 'Video Generation',
    subtitle: 'Creative Vision, One-Click Creation',
    image: '/feature-video-gen.jpg',
    gradient: 'from-amber-500/20 to-orange-500/20',
    path: '/generate/video'
},
```

---

## Summary of What to Re-add

When re-implementing video generation, you need to:

1. **ModelSelectorModal** — Add Video tab toggle, `videoModels` import, `initialMode` prop
2. **SettingsPanel** — Add `mode` prop, `isVideoMode` variable, pass `initialMode` to modal
3. **GeneratePage** — Add Video nav item, `useParams` for mode, auto-switch model useEffect, conditional endpoint/body in handleGenerate, pass `mode` to SettingsPanel
4. **Sidebar** — Add AI Video nav link
5. **HomePage** — Change Unlimited Generation card back to Video Generation
6. **Router** — Ensure `/generate/:mode` route pattern exists

The backend (`video.ts`, `status.ts`) and model data (`modelData.ts` video models) are already intact.
