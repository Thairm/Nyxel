import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Image,
  AppWindow,
  Bot,
  Users,
  Volume2,
  MoreHorizontal,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { SettingsPanel } from '@/components/generate/SettingsPanel';
import { PreviewArea } from '@/components/generate/PreviewArea';
import { PromptBar } from '@/components/generate/PromptBar';
import { getDefaultModel, getEffectiveParams, type Model, imageModels } from '@/data/modelData';
import type { UploadedImage } from '@/components/generate/ImageUploadPanel';
import { useAuth, usePromoStatus } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// Navigation items for left sidebar with labels
const navItems = [
  { icon: Image, label: 'Image', path: '/generate/image' },
  { icon: AppWindow, label: 'AI App', path: '#' },
  { icon: Bot, label: 'Agent', path: '#' },
  { icon: Users, label: 'Character', path: '#' },
  { icon: Volume2, label: 'Audio', path: '#' },
  { icon: MoreHorizontal, label: 'More', path: '#' },
];

export interface GenerationSettings {
  ratio?: string;
  duration?: number;
  variantId?: string;
  resolution?: string;
  size?: string;
  shotType?: string;
  promptExpansion?: boolean;
  generateAudio?: boolean;
  negativePrompt?: string;
  seed?: number;
  steps?: number;
  cfgScale?: number;
  scheduler?: string;
  clipSkip?: number;
  [key: string]: any;  // Allow additional params
}

export interface GeneratedItem {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  prompt: string;
  modelId: number;
  createdAt: string;
  batchId: string;  // Groups images from the same generation together
  settings?: GenerationSettings;
}

// Items currently being polled (not yet completed)
interface PendingJob {
  id: string;
  provider: 'atlas' | 'civitai';
  jobId?: string;
  token?: string;
  prompt: string;
  modelId: number;
  mediaType: 'image' | 'video';
  userId: string;
  errorCount: number;
  settings?: GenerationSettings;
  creditCost?: { type: string; cost: number } | null;
}

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ERRORS = 10;

export default function GeneratePage() {
  const { mode } = useParams<{ mode: string }>();
  const isVideoMode = mode === 'video';
  const { user } = useAuth();
  const { currentTier } = usePromoStatus();
  
  // Check if user can use Free Creation (Pro and Ultra tiers only)
  const canUseFreeCreation = currentTier === 'pro' || currentTier === 'ultra';
  
  // Get tier display name (capitalize first letter)
  const tierDisplayName = currentTier ? currentTier.charAt(0).toUpperCase() + currentTier.slice(1) : 'Free';

  const [selectedRatio, setSelectedRatio] = useState('2:3');
  const [imageQuantity, setImageQuantity] = useState(4);
  const [videoResolution, setVideoResolution] = useState('1080p');
  const [videoDuration, setVideoDuration] = useState(5);
  const [privateCreation, setPrivateCreation] = useState(false);
  const [freeCreation, setFreeCreation] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // CivitAI advanced settings
  const [seed, setSeed] = useState(-1);
  const [steps, setSteps] = useState(30);
  const [cfgScale, setCfgScale] = useState(7);
  const [scheduler, setScheduler] = useState('EulerA');
  const [clipSkip, setClipSkip] = useState(2);
  const [videoSize, setVideoSize] = useState('1280*720');
  // Wan 2.6 advanced settings
  const [shotType, setShotType] = useState('multi');
  const [promptExpansion, setPromptExpansion] = useState(true);
  const [generateAudio, setGenerateAudio] = useState(true);

  // Image upload state (base64 data URIs, only in browser memory)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [lastImage, setLastImage] = useState<UploadedImage | null>(null);

  // Credit balance
  const [gems, setGems] = useState<number>(0);
  const [crystals, setCrystals] = useState<number>(0);

  const [selectedModel, setSelectedModel] = useState<Model>(
    imageModels[0]
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    selectedModel.defaultVariant
  );

  // Auto-switch model when navigating (only Image mode now)
  useEffect(() => {
    // Always use first image model since video is removed
    const defaultModel = imageModels[0];
    setSelectedModel(defaultModel);
    setSelectedVariantId(defaultModel.defaultVariant);
    // Clear uploaded images when switching
    setUploadedImages([]);
    setLastImage(null);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Generated items (completed) — newest first
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);

  // Pending jobs — useRef for synchronous polling access, useState for UI count
  const pendingJobsRef = useRef<PendingJob[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);

  // Helper: update both ref and count state
  const updatePendingJobs = useCallback((updater: (prev: PendingJob[]) => PendingJob[]) => {
    pendingJobsRef.current = updater(pendingJobsRef.current);
    setPendingCount(pendingJobsRef.current.length);
  }, []);

  // Load generation history from Supabase on mount
  useEffect(() => {
    if (!user?.id) return;

    const loadHistory = async () => {
      const { data, error } = await supabase
        .from('generations')
        .select('id, media_url, media_type, prompt, model_id, created_at, batch_id, settings')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data && !error) {
        setGeneratedItems(data.map((row: any) => ({
          id: row.id,
          mediaUrl: row.media_url,
          mediaType: row.media_type,
          prompt: row.prompt,
          modelId: row.model_id,
          createdAt: row.created_at,
          batchId: row.batch_id || row.id,
          settings: row.settings || undefined,
        })));
      }
    };

    loadHistory();
  }, [user?.id]);

  // Fetch credit balance on mount and after generation
  const fetchCredits = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/credits/balance?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setGems(data.gems ?? 0);
        setCrystals(data.crystals ?? 0);
      }
    } catch (err) {
      console.error('[CREDITS] Failed to fetch balance:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Polling function
  const pollPendingJobs = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      const jobs = [...pendingJobsRef.current]; // synchronous read!
      console.log('[POLL] Polling', jobs.length, 'jobs');

      if (jobs.length === 0) {
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
        setIsGenerating(false);
        isPollingRef.current = false;
        return;
      }

      const completedIds: string[] = [];
      const failedIds: string[] = [];
      const newItems: GeneratedItem[] = [];

      for (const job of jobs) {
        try {
          const params = new URLSearchParams({
            provider: job.provider,
            prompt: job.prompt,
            modelId: String(job.modelId),
            mediaType: job.mediaType,
            userId: job.userId,
          });

          if (job.jobId) params.set('jobId', job.jobId);
          if (job.token) params.set('token', job.token);
          if (job.settings) params.set('settings', JSON.stringify(job.settings));
          if (job.creditCost) params.set('creditCost', JSON.stringify(job.creditCost));

          console.log(`[POLL] Checking job ${job.id} (${job.provider})...`);
          const response = await fetch(`/api/generate/status?${params.toString()}`);

          if (!response.ok) {
            console.error(`[POLL] Status HTTP ${response.status} for job ${job.id}`);
            job.errorCount++;
            if (job.errorCount >= MAX_POLL_ERRORS) {
              failedIds.push(job.id);
            }
            continue;
          }

          const data = await response.json();
          console.log(`[POLL] Job ${job.id} status: ${data.status}`, data);

          if (data.status === 'completed') {
            completedIds.push(job.id);

            if (data.mediaUrl) {
              const syncBatchId = data.batchId || crypto.randomUUID();
              newItems.push({
                id: data.generationId || crypto.randomUUID(),
                mediaUrl: data.mediaUrl,
                mediaType: job.mediaType,
                prompt: job.prompt,
                modelId: job.modelId,
                createdAt: new Date().toISOString(),
                batchId: syncBatchId,
                settings: job.settings,
              });
            }

            if (data.results) {
              const batchId = data.batchId || crypto.randomUUID();
              for (const r of data.results) {
                if (r.mediaUrl) {
                  newItems.push({
                    id: r.generationId || crypto.randomUUID(),
                    mediaUrl: r.mediaUrl,
                    mediaType: job.mediaType,
                    prompt: job.prompt,
                    modelId: job.modelId,
                    createdAt: new Date().toISOString(),
                    batchId: batchId,
                    settings: job.settings,
                  });
                }
              }
            }
          } else if (data.status === 'failed') {
            failedIds.push(job.id);
            console.error('[POLL] Generation failed:', data.error);
          }
          // 'processing' — keep polling
        } catch (err) {
          console.error(`[POLL] Error for job ${job.id}:`, err);
          job.errorCount++;
          if (job.errorCount >= MAX_POLL_ERRORS) {
            failedIds.push(job.id);
          }
        }
      }

      // Remove completed/failed jobs
      const removeIds = new Set([...completedIds, ...failedIds]);
      if (removeIds.size > 0) {
        updatePendingJobs(prev => prev.filter(j => !removeIds.has(j.id)));
      }

      // Add completed items
      if (newItems.length > 0) {
        console.log('[POLL] Adding', newItems.length, 'new items');
        setGeneratedItems(prev => [...newItems, ...prev]);
      }

      // Check if we should stop polling
      if (pendingJobsRef.current.length === 0) {
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
        setIsGenerating(false);
      }
    } finally {
      isPollingRef.current = false;
    }
  }, [updatePendingJobs]);

  // Start polling when pending count changes
  useEffect(() => {
    if (pendingCount > 0 && !pollTimerRef.current) {
      console.log('[POLL] Starting poll timer, pending:', pendingCount);
      pollTimerRef.current = setInterval(pollPendingJobs, POLL_INTERVAL_MS);
    }
    return () => {
      if (pollTimerRef.current && pendingCount === 0) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [pendingCount, pollPendingJobs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const endpoint = '/api/generate/image';
      const mediaType = 'image';

      const requestBody: any = {
        modelId: selectedModel.id,
        prompt,
        userId: user?.id || null,
        quantity: imageQuantity,
        params: {
          ratio: selectedRatio,
          aspect_ratio: selectedRatio,
          resolution: videoResolution,
          // CivitAI-specific params
          ...(negativePrompt ? { negativePrompt } : {}),
          ...(seed !== -1 ? { seed } : {}),
          steps,
          cfgScale,
          scheduler,
          clipSkip,
          videoSize,
          // Wan 2.6 advanced params
          shot_type: shotType,
          enable_prompt_expansion: promptExpansion,
          generate_audio: generateAudio,
          // Image input (base64) for I2V models
          ...(uploadedImages.length === 1 ? { image: uploadedImages[0].base64 } : {}),
          ...(uploadedImages.length > 1 ? { images: uploadedImages.map(img => img.base64) } : {}),
          ...(lastImage ? { last_image: lastImage.base64 } : {}),
        }
      };

      if (selectedVariantId) {
        requestBody.variantId = selectedVariantId;
      }

      console.log('[GEN] Sending request:', endpoint, requestBody);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('[GEN] Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      // Build settings filtered by what this model actually supports
      const params = getEffectiveParams(selectedModel, selectedVariantId);
      const filteredSettings: GenerationSettings = { variantId: selectedVariantId };
      if (params.aspectRatio) filteredSettings.ratio = selectedRatio;
      if (params.size) filteredSettings.size = videoSize || params.size.default;
      if (params.duration) filteredSettings.duration = videoDuration;
      if (params.resolution) filteredSettings.resolution = videoResolution;
      if (params.shotType) filteredSettings.shotType = shotType;
      if (params.promptExpansion) filteredSettings.promptExpansion = promptExpansion;
      if (params.generateAudio) filteredSettings.generateAudio = generateAudio;
      if (params.seed && seed !== -1) filteredSettings.seed = seed;
      if (params.steps) filteredSettings.steps = steps;
      if (params.cfgScale) filteredSettings.cfgScale = cfgScale;
      if (params.scheduler) filteredSettings.scheduler = scheduler;
      if (params.clipSkip) filteredSettings.clipSkip = clipSkip;

      // CASE 1: Sync result — image already in B2
      if (data.status === 'completed' && data.mediaUrl) {
        setGeneratedItems(prev => [{
          id: data.generationId || crypto.randomUUID(),
          mediaUrl: data.mediaUrl,
          mediaType: mediaType as 'image' | 'video',
          prompt: prompt,
          modelId: selectedModel.id,
          createdAt: new Date().toISOString(),
          batchId: data.batchId || crypto.randomUUID(),
          settings: filteredSettings,
        }, ...prev]);
        setIsGenerating(false);
        fetchCredits(); // Refresh credit balance
        return;
      }

      // CASE 2: Async — add to pending and start polling
      if (data.status === 'processing') {
        const newJob: PendingJob = {
          id: crypto.randomUUID(),
          provider: data.provider,
          jobId: data.jobId,
          token: data.token,
          prompt: prompt,
          modelId: selectedModel.id,
          mediaType: mediaType as 'image' | 'video',
          userId: user?.id || 'anonymous',
          errorCount: 0,
          settings: filteredSettings,
          creditCost: data.creditCost || null,
        };

        console.log('[GEN] Adding pending job:', newJob.id, newJob.provider);
        updatePendingJobs(prev => [...prev, newJob]);
        // polling starts automatically via useEffect on pendingCount
        return;
      }

      setIsGenerating(false);
      console.warn('[GEN] Unexpected response:', data);

    } catch (err: any) {
      console.error('[GEN] Error:', err);
      // Handle 402 insufficient credits specifically
      if (err.message?.includes('Insufficient') || err.message?.includes('credit')) {
        alert('⚠️ ' + err.message + '\n\nVisit the Pricing page to upgrade your plan.');
      } else {
        alert('Error generating: ' + err.message);
      }
      setIsGenerating(false);
      fetchCredits(); // Refresh balance even on error
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F0E] flex">
      <aside className="w-16 bg-[#0D0F0E] border-r border-white/5 flex flex-col items-center py-4 fixed left-0 top-0 h-full z-50">
        <Link to="/" className="mb-4">
          <img src="/new logo.png" alt="Nyxel Logo" className="w-10 h-10 object-contain" />
        </Link>
        <nav className="flex-1 flex flex-col gap-1 w-full px-1">
          {navItems.map((item) => {
            const isActive = (isVideoMode && item.label === 'Video') || (!isVideoMode && item.label === 'Image');
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`w-full flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-white/10 text-emerald-400'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[9px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col gap-2 w-full px-1">
          <div className="w-full flex flex-col items-center gap-0.5 py-2 rounded-xl text-gray-500" title={`Current tier: ${tierDisplayName}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${currentTier === 'ultra' ? 'bg-purple-500/20' : currentTier === 'pro' ? 'bg-emerald-500/20' : currentTier === 'standard' ? 'bg-blue-500/20' : currentTier === 'starter' ? 'bg-orange-500/20' : 'bg-gray-500/20'}`}>
              <div className={`w-2 h-2 rounded-full ${currentTier === 'ultra' ? 'bg-purple-500' : currentTier === 'pro' ? 'bg-emerald-500' : currentTier === 'standard' ? 'bg-blue-500' : currentTier === 'starter' ? 'bg-orange-500' : 'bg-gray-400'}`} />
            </div>
            <span className={`text-[9px] font-medium ${currentTier === 'ultra' ? 'text-purple-400' : currentTier === 'pro' ? 'text-emerald-400' : currentTier === 'standard' ? 'text-blue-400' : currentTier === 'starter' ? 'text-orange-400' : 'text-gray-400'}`}>{tierDisplayName}</span>
          </div>
          <Link to="/pricing" className="w-full flex flex-col items-center gap-0.5 py-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all" title={`${gems} Gems`}>
            <div className="w-5 h-5 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
            </div>
            <span className="text-[9px] font-medium text-yellow-400">{gems >= 1000 ? `${(gems / 1000).toFixed(1)}K` : gems}</span>
          </Link>
          <Link to="/pricing" className="w-full flex flex-col items-center gap-0.5 py-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all" title={`${crystals} Crystals`}>
            <div className="w-5 h-5 rounded-full bg-purple-400/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
            <span className="text-[9px] font-medium text-purple-400">{crystals >= 1000 ? `${(crystals / 1000).toFixed(1)}K` : crystals}</span>
          </Link>
        </div>
      </aside>

      <SettingsPanel
        mode={mode || 'image'}
        selectedRatio={selectedRatio}
        setSelectedRatio={setSelectedRatio}
        imageQuantity={imageQuantity}
        setImageQuantity={setImageQuantity}
        videoResolution={videoResolution}
        setVideoResolution={setVideoResolution}
        videoDuration={videoDuration}
        setVideoDuration={setVideoDuration}
        privateCreation={privateCreation}
        setPrivateCreation={setPrivateCreation}
        freeCreation={freeCreation}
        setFreeCreation={setFreeCreation}
        advancedOpen={advancedOpen}
        setAdvancedOpen={setAdvancedOpen}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        selectedVariantId={selectedVariantId}
        setSelectedVariantId={setSelectedVariantId}
        seed={seed}
        setSeed={setSeed}
        steps={steps}
        setSteps={setSteps}
        cfgScale={cfgScale}
        setCfgScale={setCfgScale}
        scheduler={scheduler}
        setScheduler={setScheduler}
        clipSkip={clipSkip}
        setClipSkip={setClipSkip}
        videoSize={videoSize}
        setVideoSize={setVideoSize}
        shotType={shotType}
        setShotType={setShotType}
        promptExpansion={promptExpansion}
        setPromptExpansion={setPromptExpansion}
        generateAudio={generateAudio}
        setGenerateAudio={setGenerateAudio}
        uploadedImages={uploadedImages}
        setUploadedImages={setUploadedImages}
        lastImage={lastImage}
        setLastImage={setLastImage}
        canUseFreeCreation={canUseFreeCreation}
        currentTier={currentTier}
      />

      <main className="flex-1 ml-0 flex flex-col h-screen overflow-hidden relative">
        <PreviewArea
          isGenerating={isGenerating}
          generatedItems={generatedItems}
          pendingCount={pendingCount}
        />
        <PromptBar
          prompt={prompt}
          setPrompt={setPrompt}
          negativePrompt={negativePrompt}
          setNegativePrompt={setNegativePrompt}
          showNegativePrompt={!!getEffectiveParams(selectedModel, selectedVariantId).negativePrompt}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      </main>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #2A2E2C; border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #3A3E3C; }
        .scrollbar-thin::-webkit-scrollbar-corner { background: transparent; }
      `}</style>
    </div>
  );
}
