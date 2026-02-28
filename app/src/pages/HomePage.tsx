import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lightbulb } from 'lucide-react';
import Masonry from 'react-masonry-css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { FeatureCard } from '@/components/home/FeatureCard';
import { ModelCard } from '@/components/home/ModelCard';
import { GalleryCard } from '@/components/home/GalleryCard';
import { SectionHeader } from '@/components/home/SectionHeader';
import { getHubModels } from '@/data/modelData';

// Feature cards data
const featureCards = [
    {
        title: 'Image Generation',
        subtitle: 'Intelligent Drawing, Instant Artistry',
        image: '/feature-image-gen.jpg',
        gradient: 'from-emerald-500/20 to-teal-500/20',
        path: '/generate/image'
    },
    {
        title: 'Unlimited Generation',
        subtitle: 'Free Creation for Pro & Ultra',
        image: '/feature-video-gen.jpg',
        gradient: 'from-amber-500/20 to-orange-500/20',
        path: '/pricing'
    },
    {
        title: 'Illustration Studio',
        subtitle: 'Anime, Fantasy & Portrait Art',
        image: '/feature-ai-char.jpg', // Replace with /feature-illustration.jpg after generating one on Nyxel
        gradient: 'from-purple-500/20 to-pink-500/20',
        path: '/generate/image'
    }
];

// AI Models data - imported from shared modelData
const aiModels = getHubModels();

// Gallery data
const galleryItems = [
    { id: 1, title: 'Sky Castle', author: 'Alisa', likes: 867, comments: 73, image: '/gallery-1.jpg' },
    { id: 2, title: 'Royal Treatment', author: 'Kaylen', likes: 416, comments: 38, image: '/gallery-2.jpg' },
    { id: 3, title: 'Neon Dreams', author: 'Noir8', likes: 551, comments: 54, image: '/gallery-3.jpg' },
    { id: 4, title: 'City Reflections', author: 'Griff', likes: 208, comments: 27, image: '/gallery-4.jpg' },
    { id: 5, title: 'Piano Melody', author: 'TRICK', likes: 390, comments: 37, image: '/model-1.jpg' },
    { id: 6, title: 'Sunflower Girl', author: 'minase', likes: 464, comments: 59, image: '/model-2.jpg' },
    { id: 7, title: 'Opera Night', author: 'momokuma', likes: 255, comments: 33, image: '/model-3.jpg' },
    { id: 8, title: 'Cyber Rebel', author: 'Passion', likes: 380, comments: 41, image: '/model-5.jpg' },
];

export default function HomePage() {
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div className="min-h-screen bg-[#0D0F0E]">
            <Sidebar />
            <Header />

            <main className="ml-60 pt-16 min-h-screen">
                <div className={`p-6 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Feature Cards */}
                    <section className="mb-8">
                        <div className="grid grid-cols-3 gap-4">
                            {featureCards.map((card, index) => (
                                <div key={card.title} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <FeatureCard
                                        card={card}
                                        onClick={() => card.path !== '#' && navigate(card.path)}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* AI Models Section */}
                    <section className="mb-8">
                        <SectionHeader
                            title="Featured AI Models"
                            icon={Sparkles}
                            action="View All"
                        />
                        <div className="overflow-x-auto scrollbar-thin pb-2 -mx-6 px-6">
                            <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                                {aiModels.map((model, index) => (
                                    <div
                                        key={model.id}
                                        className="animate-fade-in-up flex-shrink-0"
                                        style={{ animationDelay: `${index * 0.05}s`, width: '200px' }}
                                    >
                                        <ModelCard model={model} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Explore Gallery Section */}
                    <section className="mb-8">
                        <SectionHeader
                            title="Explore Community Creations"
                            icon={Lightbulb}
                        />
                        <Masonry
                            breakpointCols={{
                                default: 4,
                                1100: 3,
                                700: 2,
                                500: 1
                            }}
                            className="flex w-auto -ml-4"
                            columnClassName="pl-4 bg-clip-padding"
                        >
                            {galleryItems.map((item, index) => (
                                <div key={item.id} className="mb-4 animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <GalleryCard item={item} />
                                </div>
                            ))}
                        </Masonry>
                    </section>

                    {/* Footer */}
                    <footer className="mt-12 pt-8 border-t border-white/5">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img
                                        src="/new logo.png"
                                        alt="Nyxel Logo"
                                        className="w-5 h-5 object-contain"
                                    />
                                    <span className="text-white font-semibold">Nyxel</span>
                                </div>
                                <div className="flex gap-6 text-gray-500 text-sm">
                                    <a href="/terms" className="hover:text-emerald-400 transition-colors">Terms</a>
                                    <a href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy</a>
                                    <a href="/commerce" className="hover:text-emerald-400 transition-colors">Commerce Disclosure</a>
                                    <a href="/contact" className="hover:text-emerald-400 transition-colors">Contact</a>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-gray-600 text-xs">
                                <p>Customer Support: <a href="mailto:Nyxel.ai@proton.me" className="text-gray-500 hover:text-emerald-400 transition-colors">Nyxel.ai@proton.me</a></p>
                                <p>© 2026 Nyxel. All rights reserved.</p>
                            </div>
                        </div>
                    </footer>
                </div>
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
        }
        .scrollbar-thin::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
        </div>
    );
}
