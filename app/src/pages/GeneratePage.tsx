import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { PreviewArea } from '@/components/generate/PreviewArea';
import { PromptBar } from '@/components/generate/PromptBar';
import { getDefaultModel, ACTIVE_IMAGE_MODELS, type Model } from '@/data/modelData';
import { useAuth, usePromoStatus } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export interface GenerationSettings {
  ratio?: string;
  variantId?: string;
  negativePrompt?: string;
  seed?: number;
  steps?: number;
  cfgScale?: number;
  scheduler?: string;
  clipSkip?: number;
  [key: string]: any;
}

export interface GeneratedItem {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  prompt: string;
  modelId: number;
  createdAt: string;
  batchId: string;
  settings?: GenerationSettings;
}

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

// Crystal costs — only Crystals (no Gems)
const GENERATION_COSTS: Record<number, { type: 'crystals'; cost: number }> = {
  6:  { type: 'crystals', cost: 20 },
  7:  { type: 'crystals', cost: 10 },  // Nyxel V1.0
  9:  { type: 'crystals', cost: 10 },
  10: { type: 'crystals', cost: 10 },
  11: { type: 'crystals', cost: 10 },
  12: { type: 'crystals', cost: 10 },
  13: { type: 'crystals', cost: 10 },
  14: { type: 'crystals', cost: 10 },
};

const FREE_ELIGIBLE_IDS = new Set([7, 9, 10, 11, 12, 13, 14]);

export default function GeneratePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTier } = usePromoStatus();
  // Standard is the highest tier now; it gets free generation
  const canUseFreeCreation = currentTier === 'standard';

  // Core generation state
  const [selectedRatio, setSelectedRatio] = useState('2:3');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Credit balance
  const [crystals, setCrystals] = useState<number>(0);

  // Pagination
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Model — always Nyxel V1.0 (ID 7) as default, dropdown shows ACTIVE_IMAGE_MODELS
  const [selectedModel, setSelectedModel] = useState<Model>(getDefaultModel('image'));

  // Dynamic cost label
  const generationCost = useMemo(() => {
    if (canUseFreeCreation && FREE_ELIGIBLE_IDS.has(selectedModel.id)) {
      return { type: 'free' as const, cost: 0, label: 'Free ✨' };
    }
    const base = GENERATION_COSTS[selectedModel.id];
    if (!base) return null;
    return { type: base.type, cost: base.cost, label: `${base.cost} 💜` };
  }, [selectedModel.id, canUseFreeCreation]);

  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);

  const pendingJobsRef = useRef<PendingJob[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);

  const updatePendingJobs = useCallback((updater: (prev: PendingJob[]) => PendingJob[]) => {
    pendingJobsRef.current = updater(pendingJobsRef.current);
    setPendingCount(pendingJobsRef.current.length);
  }, []);

  // Load generation history
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
        setHasMoreHistory(data.length === 50);
      }
    };
    loadHistory();
  }, [user?.id]);

  const loadMoreHistory = useCallback(async () => {
    if (!user?.id || loadingMore || !hasMoreHistory || generatedItems.length === 0) return;
    setLoadingMore(true);
    try {
      const oldestItem = generatedItems[generatedItems.length - 1];
      const { data, error } = await supabase
        .from('generations')
        .select('id, media_url, media_type, prompt, model_id, created_at, batch_id, settings')
        .eq('user_id', user.id)
        .lt('created_at', oldestItem.createdAt)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data && !error) {
        const mapped = data.map((row: any) => ({
          id: row.id, mediaUrl: row.media_url, mediaType: row.media_type,
          prompt: row.prompt, modelId: row.model_id, createdAt: row.created_at,
          batchId: row.batch_id || row.id, settings: row.settings || undefined,
        }));
        setGeneratedItems(prev => [...prev, ...mapped]);
        setHasMoreHistory(data.length === 50);
      }
    } catch (err) {
      console.error('[HISTORY] Failed to load more:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [user?.id, loadingMore, hasMoreHistory, generatedItems]);

  const fetchCredits = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/credits/balance?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setCrystals(data.crystals ?? 0);
      }
    } catch (err) {
      console.error('[CREDITS] Failed to fetch balance:', err);
    }
  }, [user?.id]);

  useEffect(() => { fetchCredits(); }, [fetchCredits]);

  const pollPendingJobs = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    try {
      const jobs = [...pendingJobsRef.current];
      if (jobs.length === 0) {
        if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
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
            provider: job.provider, prompt: job.prompt,
            modelId: String(job.modelId), mediaType: job.mediaType, userId: job.userId,
          });
          if (job.jobId) params.set('jobId', job.jobId);
          if (job.token) params.set('token', job.token);
          if (job.settings) params.set('settings', JSON.stringify(job.settings));
          if (job.creditCost) params.set('creditCost', JSON.stringify(job.creditCost));

          const response = await fetch(`/api/generate/status?${params.toString()}`);
          if (!response.ok) {
            job.errorCount++;
            if (job.errorCount >= MAX_POLL_ERRORS) failedIds.push(job.id);
            continue;
          }
          const data = await response.json();
          if (data.status === 'completed') {
            completedIds.push(job.id);
            const batchId = data.batchId || crypto.randomUUID();
            if (data.mediaUrl) {
              newItems.push({ id: data.generationId || crypto.randomUUID(), mediaUrl: data.mediaUrl, mediaType: job.mediaType, prompt: job.prompt, modelId: job.modelId, createdAt: new Date().toISOString(), batchId, settings: job.settings });
            }
            if (data.results) {
              for (const r of data.results) {
                if (r.mediaUrl) newItems.push({ id: r.generationId || crypto.randomUUID(), mediaUrl: r.mediaUrl, mediaType: job.mediaType, prompt: job.prompt, modelId: job.modelId, createdAt: new Date().toISOString(), batchId, settings: job.settings });
              }
            }
          } else if (data.status === 'failed') {
            failedIds.push(job.id);
            alert('⚠️ Generation failed: ' + (data.error || 'Unknown error. No credits were deducted.'));
          }
        } catch (err) {
          job.errorCount++;
          if (job.errorCount >= MAX_POLL_ERRORS) failedIds.push(job.id);
        }
      }

      const removeIds = new Set([...completedIds, ...failedIds]);
      if (removeIds.size > 0) updatePendingJobs(prev => prev.filter(j => !removeIds.has(j.id)));
      if (newItems.length > 0) { setGeneratedItems(prev => [...newItems, ...prev]); fetchCredits(); }
      if (pendingJobsRef.current.length === 0) {
        if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
        setIsGenerating(false);
      }
    } finally { isPollingRef.current = false; }
  }, [updatePendingJobs, fetchCredits]);

  useEffect(() => {
    if (pendingCount > 0 && !pollTimerRef.current) {
      pollTimerRef.current = setInterval(pollPendingJobs, POLL_INTERVAL_MS);
    }
    return () => { if (pollTimerRef.current && pendingCount === 0) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; } };
  }, [pendingCount, pollPendingJobs]);

  useEffect(() => {
    return () => { if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; } };
  }, []);

  const handleGenerate = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const requestBody: any = {
        modelId: selectedModel.id,
        prompt,
        userId: user?.id || null,
        quantity: 1,  // Always 1 — no batch
        freeCreation: canUseFreeCreation,
        params: {
          ratio: selectedRatio,
          aspect_ratio: selectedRatio,
          ...(negativePrompt ? { negativePrompt } : {}),
          steps: 30, cfgScale: 7, scheduler: 'EulerA', clipSkip: 2,
        }
      };

      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate');

      const filteredSettings: GenerationSettings = { ratio: selectedRatio };
      if (negativePrompt) filteredSettings.negativePrompt = negativePrompt;

      if (data.status === 'completed' && data.mediaUrl) {
        setGeneratedItems(prev => [{
          id: data.generationId || crypto.randomUUID(), mediaUrl: data.mediaUrl,
          mediaType: 'image', prompt, modelId: selectedModel.id,
          createdAt: new Date().toISOString(), batchId: data.batchId || crypto.randomUUID(),
          settings: filteredSettings,
        }, ...prev]);
        setIsGenerating(false);
        fetchCredits();
        return;
      }

      if (data.status === 'processing') {
        const newJob: PendingJob = {
          id: crypto.randomUUID(), provider: data.provider, jobId: data.jobId,
          token: data.token, prompt, modelId: selectedModel.id, mediaType: 'image',
          userId: user?.id || 'anonymous', errorCount: 0, settings: filteredSettings,
          creditCost: data.creditCost || null,
        };
        updatePendingJobs(prev => [...prev, newJob]);
        return;
      }

      setIsGenerating(false);
    } catch (err: any) {
      if (err.message?.includes('Insufficient') || err.message?.includes('credit')) {
        alert('⚠️ ' + err.message + '\n\nVisit the Pricing page to upgrade your plan.');
      } else {
        alert('Error generating: ' + err.message);
      }
      setIsGenerating(false);
      fetchCredits();
    }
  };

  return (
    <div className="h-screen bg-[#0D0F0E] flex flex-col overflow-hidden text-white">

      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/new logo.png" alt="Nyxel" className="w-7 h-7 object-contain" />
          <span className="text-sm font-bold text-white hidden sm:block">Nyxel</span>
        </Link>

        {/* Credits display */}
        <div className="flex items-center gap-3">
          <Link to="/pricing" className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors" title={`${crystals} Crystals`}>
            <div className="w-4 h-4 rounded-full bg-purple-400/30 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
            <span className="font-medium text-purple-300">{crystals.toLocaleString()}</span>
          </Link>

          {user ? (
            <Link to="/pricing" className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all capitalize">
              {currentTier ?? 'Free'}
            </Link>
          ) : (
            <Link to="/auth" className="text-xs px-3 py-1.5 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition-colors flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* ── Preview Area (fills remaining space) ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <PreviewArea
          isGenerating={isGenerating}
          generatedItems={generatedItems}
          pendingCount={pendingCount}
          onLoadMore={loadMoreHistory}
          hasMoreHistory={hasMoreHistory}
          loadingMore={loadingMore}
        />
      </div>

      {/* ── Prompt Bar (pinned to bottom) ── */}
      <div className="flex-shrink-0 border-t border-white/5">
        <PromptBar
          prompt={prompt}
          setPrompt={setPrompt}
          negativePrompt={negativePrompt}
          setNegativePrompt={setNegativePrompt}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          costLabel={generationCost?.label || ''}
          selectedRatio={selectedRatio}
          onRatioChange={setSelectedRatio}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          availableModels={ACTIVE_IMAGE_MODELS}
        />
      </div>

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
