# Execution Plan: Update Nano Banana Pro Integration

## Goal
Update the Nano Banana Pro API integration code to use sync mode and base64 output for better reliability.

## Changes Required

### File: `functions/api/generate/image.ts`
**Lines:** 20-48

**Current Code:**
```typescript
body: JSON.stringify({
    model: "google/nano-banana-pro/text-to-image",
    prompt: prompt,
    aspect_ratio: params?.aspect_ratio || "1:1",
    output_format: params?.output_format || "png",
    ...params
})
```

**Updated Code:**
```typescript
body: JSON.stringify({
    model: "google/nano-banana-pro/text-to-image",
    prompt: prompt,
    // Use aspect_ratio from params, but default to 1:1
    aspect_ratio: params?.aspect_ratio || "1:1",
    output_format: params?.output_format || "png",
    // CRITICAL: Sync mode waits for the image to finish
    enable_sync_mode: true, 
    enable_base64_output: true // This often makes it easier to display immediately
})
```

**Add comment before return:**
```typescript
// Now 'data' will actually contain the image URL or base64 string 
// because we used sync mode!
```

## Reasoning
- Sync mode ensures we get the complete response with image data
- Base64 output allows immediate display without additional fetch
- This should fix the 402 error by ensuring proper API response handling

## Testing
After deployment, test Nano Banana Pro generation to verify:
1. No more 402 errors
2. Image generates successfully
3. Response contains image data (URL or base64)
