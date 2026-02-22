import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Image,
  Video,
  AppWindow,
  Bot,
  Users,
  Volume2,
  MoreHorizontal,
  Zap
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { SettingsPanel } from '@/components/generate/SettingsPanel';
import { PreviewArea } from '@/components/generate/PreviewArea';
import { PromptBar } from '@/components/generate/PromptBar';
import { getDefaultModel, type Model } from '@/data/modelData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// Navigation items for left sidebar with labels
const navItems = [
  { icon: Image, label: 'Image', path: '/generate/image' },
  { icon: Video, label: 'Video', path: '/generate/video' },
  { icon: AppWindow, label: 'AI App', path: '#' },
  { icon: Bot, label: 'Agent', path: '#' },
  { icon: Users, label: 'Character', path: '#' },
  { icon: Volume2, label: 'Audio', path: '#' },
  { icon: MoreHorizontal, label: 'More', path: '#' },
];

export interface GeneratedItem {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  prompt: string;
  modelId: number;
  createdAt: string;
}

// Items currently being polled (not yet completed)
interface PendingJob {
  id: string;         // unique ID for this pending job
  provider: 'atlas' | 'civitai';
  jobId?: string;     // Atlas Cloud
  token?: string;     // CivitAI
  prompt: string;
  modelId: number;
  mediaType: 'image' | 'video';
  userId: string;
  errorCount: number; // track consecutive errors
}

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ERRORS = 10;

export default function GeneratePage() {
  const { mode } = useParams<{ mode: string }>();
  const isVideoMode = mode === 'video';
  const { user } = useAuth();

  const [generationMode, setGenerationMode] = useState<'standard' | 'quality'>('standard');
  const [selectedRatio, setSelectedRatio] = useState('2:3');
  const [imageQuantity, setImageQuantity] = useState(4);
  const [videoResolution, setVideoResolution] = useState('1080p');
  const [videoFps, setVideoFps] = useState(30);
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoQuantity, setVideoQuantity] = useState(2);
  const [privateCreation, setPrivateCreation] = useState(false);
  const [freeCreation, setFreeCreation] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Model and variant selection state
  const [selectedModel, setSelectedModel] = useState<Model>(
    getDefaultModel(mode === 'video' ? 'video' : 'image')
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    selectedModel.defaultVariant
  );

  // Generated items (completed) — newest first
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);

  // Pending jobs — tracked as state so UI re-renders when jobs are added/removed  
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false); // prevent concurrent polls

  // Load generation history from Supabase on mount
  useEffect(() => {
    if (!user?.id) return;

    const loadHistory = async () => {
      const { data, error } = await supabase
        .from('generations')
        .select('id, media_url, media_type, prompt, model_id, created_at')
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
        })));
      }
    };

    loadHistory();
  }, [user?.id]);

  // Polling loop — runs every 3s when there are pending jobs
  const pollPendingJobs = useCallback(async () => {
    // Prevent concurrent polls
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      setPendingJobs(currentJobs => {
        // We can't do async inside setState, so we trigger the actual poll outside
        return currentJobs;
      });

      // Read current pending jobs
      let currentPending: PendingJob[] = [];
      setPendingJobs(prev => { currentPending = prev; return prev; });

      if (currentPending.length === 0) {
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
        setIsGenerating(false);
        isPollingRef.current = false;
        return;
      }

      const completedJobIds: string[] = [];
      const failedJobIds: string[] = [];
      const newItems: GeneratedItem[] = [];
      const errorUpdates: { id: string; count: number }[] = [];

      for (const job of currentPending) {
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

          const response = await fetch(`/api/generate/status?${params.toString()}`);

          if (!response.ok) {
            console.error(`[POLL] Status returned ${response.status} for job ${job.id}`);
            errorUpdates.push({ id: job.id, count: job.errorCount + 1 });
            if (job.errorCount + 1 >= MAX_POLL_ERRORS) {
              failedJobIds.push(job.id);
              console.error(`[POLL] Job ${job.id} failed after ${MAX_POLL_ERRORS} errors`);
            }
            continue;
          }

          const data = await response.json();
          console.log(`[POLL] Job ${job.id} status:`, data.status);

          if (data.status === 'completed') {
            completedJobIds.push(job.id);

            // Handle single result (Atlas Cloud)
            if (data.mediaUrl) {
              newItems.push({
                id: data.generationId || crypto.randomUUID(),
                mediaUrl: data.mediaUrl,
                mediaType: job.mediaType,
                prompt: job.prompt,
                modelId: job.modelId,
                createdAt: new Date().toISOString(),
              });
            }

            // Handle multiple results (CivitAI)
            if (data.results) {
              for (const r of data.results) {
                newItems.push({
                  id: r.generationId || crypto.randomUUID(),
                  mediaUrl: r.mediaUrl,
                  mediaType: job.mediaType,
                  prompt: job.prompt,
                  modelId: job.modelId,
                  createdAt: new Date().toISOString(),
                });
              }
            }
          } else if (data.status === 'failed') {
            failedJobIds.push(job.id);
            console.error('[POLL] Generation failed:', data.error);
          }
          // 'processing' — keep polling
        } catch (err) {
          console.error('[POLL] Error polling job:', job.id, err);
          errorUpdates.push({ id: job.id, count: job.errorCount + 1 });
          if (job.errorCount + 1 >= MAX_POLL_ERRORS) {
            failedJobIds.push(job.id);
          }
        }
      }

      // Update state: remove completed/failed jobs
      if (completedJobIds.length > 0 || failedJobIds.length > 0 || errorUpdates.length > 0) {
        const removeIds = new Set([...completedJobIds, ...failedJobIds]);
        setPendingJobs(prev => {
          const updated = prev
            .filter(j => !removeIds.has(j.id))
            .map(j => {
              const errUpdate = errorUpdates.find(e => e.id === j.id);
              return errUpdate ? { ...j, errorCount: errUpdate.count } : j;
            });

          // If no more pending, stop polling
          if (updated.length === 0) {
            if (pollTimerRef.current) {
              clearInterval(pollTimerRef.current);
              pollTimerRef.current = null;
            }
            setIsGenerating(false);
          }

          return updated;
        });
      }

      // Add new completed items
      if (newItems.length > 0) {
        setGeneratedItems(prev => [...newItems, ...prev]);
      }
    } finally {
      isPollingRef.current = false;
    }
  }, []);

  // Start/stop polling timer when pendingJobs changes
  useEffect(() => {
    if (pendingJobs.length > 0 && !pollTimerRef.current) {
      pollTimerRef.current = setInterval(pollPendingJobs, POLL_INTERVAL_MS);
    }
    if (pendingJobs.length === 0 && pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [pendingJobs.length, pollPendingJobs]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const endpoint = mode === 'video' ? '/api/generate/video' : '/api/generate/image';
      const mediaType = mode === 'video' ? 'video' : 'image';

      const requestBody: any = {
        modelId: selectedModel.id,
        prompt,
        userId: user?.id || null,
        params: {
          ratio: selectedRatio,
          aspect_ratio: selectedRatio,
          ...(mode === 'video' ? { duration: videoDuration } : {}),
        }
      };

      // Add variant ID for video models
      if (mode === 'video' && selectedVariantId) {
        requestBody.variantId = selectedVariantId;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Generation response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      // CASE 1: Sync result — image is already uploaded to B2
      if (data.status === 'completed' && data.mediaUrl) {
        setGeneratedItems(prev => [{
          id: data.generationId || crypto.randomUUID(),
          mediaUrl: data.mediaUrl,
          mediaType: mediaType as 'image' | 'video',
          prompt: prompt,
          modelId: selectedModel.id,
          createdAt: new Date().toISOString(),
        }, ...prev]);
        setIsGenerating(false);
        return;
      }

      // CASE 2: Async result — need to poll
      if (data.status === 'processing') {
        const pendingJob: PendingJob = {
          id: crypto.randomUUID(),
          provider: data.provider,
          jobId: data.jobId,
          token: data.token,
          prompt: prompt,
          modelId: selectedModel.id,
          mediaType: mediaType as 'image' | 'video',
          userId: user?.id || 'anonymous',
          errorCount: 0,
        };

        setPendingJobs(prev => [...prev, pendingJob]);
        return;
      }

      // Unhandled response
      setIsGenerating(false);
      console.warn('Unexpected response:', data);

    } catch (err) {
      console.error(err);
      alert('Error generating: ' + (err as Error).message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F0E] flex">
      {/* Left Sidebar with Labels */}
      <aside className="w-16 bg-[#0D0F0E] border-r border-white/5 flex flex-col items-center py-4 fixed left-0 top-0 h-full z-50">
        {/* Logo */}
        <Link to="/" className="mb-4">
          <img
            src="/new logo.png"
            alt="Nyxel Logo"
            className="w-10 h-10 object-contain"
          />
        </Link>

        {/* Navigation with Labels */}
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

        {/* Bottom icons */}
        <div className="flex flex-col gap-2 w-full px-1">
          <button className="w-full flex flex-col items-center gap-0.5 py-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <Zap className="w-5 h-5" />
            <span className="text-[9px] font-medium">106</span>
          </button>
          <button className="w-full flex flex-col items-center gap-0.5 py-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[9px] font-bold">
              U
            </div>
            <span className="text-[9px] font-medium">1.0K</span>
          </button>
        </div>
      </aside>

      {/* Settings Panel */}
      <SettingsPanel
        mode={mode || 'image'}
        generationMode={generationMode}
        setGenerationMode={setGenerationMode}
        selectedRatio={selectedRatio}
        setSelectedRatio={setSelectedRatio}
        imageQuantity={imageQuantity}
        setImageQuantity={setImageQuantity}
        videoResolution={videoResolution}
        setVideoResolution={setVideoResolution}
        videoFps={videoFps}
        setVideoFps={setVideoFps}
        videoDuration={videoDuration}
        setVideoDuration={setVideoDuration}
        videoQuantity={videoQuantity}
        setVideoQuantity={setVideoQuantity}
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
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 flex flex-col h-screen overflow-hidden relative">
        <PreviewArea
          isGenerating={isGenerating}
          generatedItems={generatedItems}
          pendingCount={pendingJobs.length}
        />
        <PromptBar
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      </main>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #2A2E2C;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #3A3E3C;
          border-color: #3A3E3C;
        }
        .scrollbar-thin::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}
      </style>
    </div>
  );
}
