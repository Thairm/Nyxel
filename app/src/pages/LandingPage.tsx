import { Link } from 'react-router-dom';
import { Sparkles, FileText, DollarSign } from 'lucide-react';
import { useAuth, getUserDisplayInfo } from '@/hooks/useAuth';

export default function LandingPage() {
    const { user } = useAuth();
    const { displayName, avatarUrl, initial } = getUserDisplayInfo(user);

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-black text-white font-sans select-none">
            {/* Google Fonts */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />

            {/* ── Background Image ── */}
            <div className="absolute inset-0">
                <img
                    src="/landing-bg.png"
                    alt=""
                    className="w-full h-full object-cover object-center"
                    draggable={false}
                />
                {/* Dark overlay so text is readable */}
                <div className="absolute inset-0 bg-black/55" />
                {/* Bottom gradient for extra legibility near CTA */}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />
            </div>

            {/* ── Top Navigation ── */}
            <nav className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-8 py-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <img src="/new logo.png" alt="Nyxel" className="w-7 h-7 object-contain" />
                    <span className="text-lg font-bold tracking-tight">Nyxel</span>
                </div>

                {/* Nav links */}
                <div className="flex items-center gap-1 sm:gap-3">
                    <Link
                        to="/docs"
                        className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10"
                    >
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Docs</span>
                    </Link>
                    <Link
                        to="/pricing"
                        className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10"
                    >
                        <DollarSign className="w-4 h-4" />
                        <span className="hidden sm:inline">Pricing</span>
                    </Link>

                    {user ? (
                        <Link
                            to="/generate"
                            className="flex items-center gap-1.5 text-xs sm:text-sm bg-white/10 border border-white/20 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-white/20 transition-all"
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={displayName} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-[10px] font-bold">
                                    {initial}
                                </div>
                            )}
                            <span className="hidden sm:inline">{displayName}</span>
                        </Link>
                    ) : (
                        <Link
                            to="/auth"
                            className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </nav>

            {/* ── Hero Content ── */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
                {/* Badge */}
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs font-medium text-gray-200">AI Anime & Illustration Generator</span>
                </div>

                {/* Headline */}
                <h1
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight tracking-tight"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Create stunning<br />
                    <span className="italic text-yellow-300">anime art</span> instantly
                </h1>

                {/* Sub-headline */}
                <p className="text-base sm:text-lg text-gray-300 mb-10 max-w-md">
                    Type a description. Get beautiful AI-generated images in seconds.
                </p>

                {/* CTA Button */}
                <Link
                    to="/generate"
                    className="group relative inline-flex items-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-base sm:text-lg px-8 sm:px-10 py-4 rounded-full transition-all duration-200 shadow-[0_0_40px_rgba(250,204,21,0.4)] hover:shadow-[0_0_60px_rgba(250,204,21,0.5)] hover:scale-105 active:scale-95"
                >
                    <Sparkles className="w-5 h-5" />
                    Start Generating Images
                </Link>

                {/* Free nudge */}
                <p className="mt-5 text-sm text-gray-400">
                    Free to start · No credit card required
                </p>
            </div>

            {/* ── Bottom Footer Strip ── */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-8 py-3 flex items-center justify-center gap-4 sm:gap-6 text-xs text-gray-500">
                <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link to="/commerce" className="hover:text-white transition-colors">Commerce</Link>
                <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                <span>© 2026 Nyxel</span>
            </div>
        </div>
    );
}
