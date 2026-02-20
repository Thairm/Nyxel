import { useState } from 'react';
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
import { getDefaultModel } from '@/data/modelData';

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

export default function GeneratePage() {
  const { mode } = useParams<{ mode: string }>();
  const isVideoMode = mode === 'video';

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

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      // Use the default model for the current mode, or get selected from SettingsPanel state if stored there
      const currentModel = getDefaultModel(mode === 'video' ? 'video' : 'image');
      const endpoint = mode === 'video' ? '/api/generate/video' : '/api/generate/image';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: currentModel.id,
          prompt,
          params: {
            ratio: selectedRatio,
            quantity: mode === 'video' ? videoQuantity : imageQuantity,
            resolution: videoResolution
          }
        })
      });

      const data = await response.json();
      console.log('Generation response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      // TODO: Handle success (job ID polling vs immediate result)
      // If it returns a job ID: start polling /api/generate/status
    } catch (err) {
      console.error(err);
      alert('Error generating: ' + (err as Error).message);
    } finally {
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
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 flex flex-col h-screen overflow-hidden relative">
        <PreviewArea isGenerating={isGenerating} />
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
      `}</style>
    </div>
  );
}
