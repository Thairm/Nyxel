import { Link } from 'react-router-dom';
import { Check, Sparkles, Gem, Diamond, Zap, Crown, ArrowLeft, Info, LogIn, LogOut, Tag } from 'lucide-react';
import { useAuth, usePromoStatus } from '../hooks/useAuth';
import { TIER_ORDER } from '../lib/supabase';

interface TierLinks {
    default: string;
    promo: string;
}

interface PricingTier {
    id: string;
    name: string;
    price: string;
    priceNum: number;
    promoPrice: string;
    gems: number;
    crystals: number;
    features: string[];
    highlight?: boolean;
    badge?: string;
    icon: React.ReactNode;
    links: TierLinks;
}

// ============================================================
// PASTE YOUR STRIPE PAYMENT LINK URLs HERE
// Replace '#' with your actual links from Stripe Dashboard
// ============================================================
const tiers: PricingTier[] = [
    {
        id: 'starter',
        name: 'Starter',
        price: '$4.99',
        priceNum: 4.99,
        promoPrice: '$2.49',
        gems: 1500,
        crystals: 500,
        icon: <Gem className="w-6 h-6" />,
        features: [
            'Everything in Free',
            '1,500 Gems / month',
            '500 Crystals / month',
            'Crystal fast-pass queue',
            'Priority support',
        ],
        links: {
            default: 'https://buy.stripe.com/9B69AT1Dx1C0gD3eGE7g404',
            promo: 'https://buy.stripe.com/5kQaEXfunbcA9aBgOM7g405?prefilled_promo_code=STARTER50cwgdfmvmvtiwerfx',
        },
    },
    {
        id: 'standard',
        name: 'Standard',
        price: '$9.99',
        priceNum: 9.99,
        promoPrice: '$4.99',
        gems: 3000,
        crystals: 1000,
        icon: <Diamond className="w-6 h-6" />,
        highlight: true,
        badge: 'Most Popular',
        features: [
            'Everything in Starter',
            '3,000 Gems / month',
            '1,000 Crystals / month',
            'Free community generation',
            'Crystal fast-pass queue',
        ],
        links: {
            default: 'https://buy.stripe.com/00wcN5fun2G42Mdbus7g406',
            promo: 'https://buy.stripe.com/dRm6oHbe75SgaeF4207g407?prefilled_promo_code=STANDARD50caefmcprgasmcakl',
        },
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$19.99',
        priceNum: 19.99,
        promoPrice: '$9.99',
        gems: 7000,
        crystals: 2000,
        icon: <Zap className="w-6 h-6" />,
        badge: 'Best Value',
        features: [
            'Everything in Standard',
            '7,000 Gems / month',
            '2,000 Crystals / month',
            'More Gems per dollar',
            'Free community generation',
        ],
        links: {
            default: 'https://buy.stripe.com/eVq9AT81V80oeuVaqo7g408',
            promo: 'https://buy.stripe.com/cNieVd3LF2G4aeF5647g409?prefilled_promo_code=PRO50mcpaefakqwerflff',
        },
    },
    {
        id: 'ultra',
        name: 'Ultra',
        price: '$29.99',
        priceNum: 29.99,
        promoPrice: '$14.99',
        gems: 11000,
        crystals: 3000,
        icon: <Crown className="w-6 h-6" />,
        features: [
            'Everything in Pro',
            '11,000 Gems / month',
            '3,000 Crystals / month',
            'Best Gems per dollar',
            'Free community generation',
        ],
        links: {
            default: 'https://buy.stripe.com/dRm3cv3LF3K886xcyw7g40a',
            promo: 'https://buy.stripe.com/00w7sL0ztcgE5Yp7ec7g40b?prefilled_promo_code=ULTRA50ratglamfesgfqwer',
        },
    },
];

const modelCosts = [
    { name: 'Nano Banana Pro', type: 'Gems', cost: 100, description: 'Premium API model' },
    { name: 'Z Image', type: 'Crystals', cost: 20, description: 'Community model' },
    { name: 'SDXL Models', type: 'Crystals', cost: 10, description: 'Community model' },
];

export default function PricingPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { promoUsed, currentTier, loading: promoLoading } = usePromoStatus();

    const isLoading = authLoading || promoLoading;

    // Determine which link to use for a tier
    const getLinkForTier = (tier: PricingTier) => {
        if (!user) return tier.links.promo; // Not logged in = show promo (they'll sign up first)
        if (promoUsed[tier.id]) return tier.links.default; // Already used promo
        return tier.links.promo; // Eligible for promo
    };

    // Check if this tier should be shown (hide lower tiers if user has higher plan)
    const shouldShowTier = (tier: PricingTier) => {
        if (!currentTier) return true;
        return (TIER_ORDER[tier.id] || 0) > (TIER_ORDER[currentTier] || 0);
    };

    // Check if promo is available for this tier
    const isPromoAvailable = (tier: PricingTier) => {
        if (!user) return true; // Assume new user
        return !promoUsed[tier.id];
    };

    // Handle subscribe click
    const handleSubscribeClick = (tier: PricingTier) => {
        if (!user) {
            window.location.href = '/auth';
            return;
        }
        // Build the payment link URL with promo flag for the success page
        const link = getLinkForTier(tier);
        // No recording here — promo usage is recorded on the SUCCESS page
        // after the user actually completes payment
        window.location.href = link;
    };

    const visibleTiers = tiers.filter(shouldShowTier);

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md py-4 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <Sparkles className="w-7 h-7 text-yellow-400" />
                        <span className="text-xl font-bold tracking-tight">Nyxel</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Home
                        </Link>
                        {user ? (
                            <button
                                onClick={signOut}
                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        ) : (
                            <Link
                                to="/auth"
                                className="flex items-center gap-2 text-sm bg-yellow-400 text-black px-4 py-2 rounded-full font-medium hover:bg-yellow-300 transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Promo Banner */}
            <div className="bg-gradient-to-r from-yellow-400/20 via-yellow-400/10 to-yellow-400/20 border-b border-yellow-400/20">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center gap-3">
                    <Tag className="w-4 h-4 text-yellow-400" />
                    <p className="text-sm text-center">
                        <span className="font-semibold text-yellow-400">🎉 Launch Special:</span>
                        <span className="text-gray-300 ml-1">50% off your first month on all plans!</span>
                    </p>
                </div>
            </div>

            {/* Hero */}
            <section className="pt-16 pb-8 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1
                        className="text-4xl sm:text-5xl md:text-6xl font-medium mb-4 tracking-tight"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Simple, transparent{' '}
                        <span className="text-yellow-400">pricing</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-4">
                        Choose the plan that fits your creative needs. Cancel anytime.
                    </p>

                    {/* Current Plan Indicator */}
                    {currentTier && (
                        <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-4 py-2 mt-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-sm text-emerald-400">
                                You're on the <strong>{currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</strong> plan
                            </span>
                        </div>
                    )}

                    {/* Credit Explainer */}
                    <div className="flex flex-wrap justify-center gap-6 mt-6">
                        <div className="flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-5 py-2.5">
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <span className="text-sm">
                                <strong className="text-yellow-400">Gems</strong>
                                <span className="text-gray-400 ml-1">— premium API models</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-3 bg-purple-400/10 border border-purple-400/20 rounded-full px-5 py-2.5">
                            <div className="w-3 h-3 rounded-full bg-purple-400" />
                            <span className="text-sm">
                                <strong className="text-purple-400">Crystals</strong>
                                <span className="text-gray-400 ml-1">— community models</span>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Free Tier + Paid Tiers */}
            <section className="py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Free Tier Banner */}
                    <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-lg font-semibold">Free Tier</h3>
                                </div>
                                <p className="text-sm text-gray-400">
                                    100 Gems + 50 Crystals per month. Create an account to start.
                                </p>
                            </div>
                            <Link
                                to={user ? '/home' : '/auth'}
                                className="bg-white/10 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-white/20 border border-white/20 transition-colors"
                            >
                                {user ? 'Go to Dashboard' : 'Create Free Account'}
                            </Link>
                        </div>
                    </div>

                    {/* Paid Tiers */}
                    {isLoading ? (
                        <div className="text-center py-16 text-gray-500">Loading plans...</div>
                    ) : (
                        <div className={`grid grid-cols-1 md:grid-cols-2 ${visibleTiers.length <= 2 ? 'max-w-3xl mx-auto' : 'lg:grid-cols-4'} gap-5`}>
                            {visibleTiers.map((tier) => {
                                const promoAvailable = isPromoAvailable(tier);

                                return (
                                    <div
                                        key={tier.name}
                                        className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${tier.highlight
                                            ? 'bg-gradient-to-b from-yellow-400/15 to-yellow-400/5 border-2 border-yellow-400/40 shadow-[0_0_40px_-8px_rgba(250,204,21,0.2)]'
                                            : 'bg-white/[0.03] border border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        {/* Badge */}
                                        {tier.badge && (
                                            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${tier.highlight
                                                ? 'bg-yellow-400 text-black'
                                                : 'bg-white/10 text-yellow-400 border border-yellow-400/30'
                                                }`}>
                                                {tier.badge}
                                            </div>
                                        )}

                                        {/* Icon */}
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${tier.highlight
                                            ? 'bg-yellow-400 text-black'
                                            : 'bg-white/10 text-gray-300'
                                            }`}>
                                            {tier.icon}
                                        </div>

                                        {/* Name */}
                                        <h3 className="text-lg font-semibold mb-1">{tier.name}</h3>

                                        {/* Price */}
                                        <div className="mb-1">
                                            {promoAvailable ? (
                                                <>
                                                    <span className="text-lg text-gray-500 line-through mr-2">{tier.price}</span>
                                                    <span className="text-3xl font-bold text-emerald-400">{tier.promoPrice}</span>
                                                </>
                                            ) : (
                                                <span className="text-3xl font-bold">{tier.price}</span>
                                            )}
                                            <span className="text-gray-500 text-sm ml-1">/ month</span>
                                        </div>

                                        {/* Promo indicator */}
                                        {promoAvailable && (
                                            <div className="text-xs text-emerald-400 mb-4">
                                                50% off first month!
                                            </div>
                                        )}
                                        {!promoAvailable && <div className="mb-4" />}

                                        {/* Credits */}
                                        <div className="flex flex-col gap-2 mb-5 pb-5 border-b border-white/10">
                                            <div className="flex items-center justify-between bg-yellow-400/5 rounded-lg px-3 py-2">
                                                <span className="text-xs text-gray-400">Gems</span>
                                                <span className="text-sm font-semibold text-yellow-400">{tier.gems.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between bg-purple-400/5 rounded-lg px-3 py-2">
                                                <span className="text-xs text-gray-400">Crystals</span>
                                                <span className="text-sm font-semibold text-purple-400">{tier.crystals.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-2.5 mb-6 flex-1">
                                            {tier.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
                                                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.highlight ? 'text-yellow-400' : 'text-emerald-400'
                                                        }`} />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA */}
                                        <button
                                            onClick={() => handleSubscribeClick(tier)}
                                            className={`w-full py-3 rounded-full text-sm font-semibold transition-all cursor-pointer ${tier.highlight
                                                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                                                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                                }`}
                                        >
                                            {!user ? 'Sign Up & Subscribe' : 'Subscribe'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Model Costs Table */}
            <section className="py-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-10">
                        <h2
                            className="text-3xl sm:text-4xl font-medium mb-3"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Credit costs per generation
                        </h2>
                        <p className="text-gray-400">See how many credits each model costs</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 overflow-hidden">
                        <div className="grid grid-cols-4 bg-white/5 px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <div className="col-span-1">Model</div>
                            <div className="col-span-1">Type</div>
                            <div className="col-span-1 text-right">Cost</div>
                            <div className="col-span-1 text-right">Gens on $9.99</div>
                        </div>
                        {modelCosts.map((model, i) => (
                            <div
                                key={model.name}
                                className={`grid grid-cols-4 px-6 py-4 items-center ${i < modelCosts.length - 1 ? 'border-b border-white/5' : ''
                                    }`}
                            >
                                <div className="col-span-1">
                                    <div className="font-medium text-sm">{model.name}</div>
                                    <div className="text-xs text-gray-500">{model.description}</div>
                                </div>
                                <div className="col-span-1">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${model.type === 'Gems'
                                        ? 'bg-yellow-400/10 text-yellow-400'
                                        : 'bg-purple-400/10 text-purple-400'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${model.type === 'Gems' ? 'bg-yellow-400' : 'bg-purple-400'
                                            }`} />
                                        {model.type}
                                    </span>
                                </div>
                                <div className="col-span-1 text-right font-semibold text-sm">
                                    {model.cost} {model.type}
                                </div>
                                <div className="col-span-1 text-right text-sm text-gray-400">
                                    ~{model.type === 'Gems'
                                        ? Math.floor(3000 / model.cost)
                                        : Math.floor(1000 / model.cost)
                                    } gens
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Queue Explainer */}
            <section className="py-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center flex-shrink-0">
                                <Info className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">How the Queue System Works</h3>
                                <div className="space-y-3 text-sm text-gray-400">
                                    <p>
                                        Community models (Z Image, SDXL) run on our serverless GPU infrastructure with a queue system:
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-xl p-4">
                                            <div className="font-medium text-white mb-1">🐢 Free Queue</div>
                                            <p className="text-xs">
                                                Available on Standard tier ($9.99+). Generate community models for free, but wait in the standard queue.
                                            </p>
                                        </div>
                                        <div className="bg-purple-400/5 border border-purple-400/10 rounded-xl p-4">
                                            <div className="font-medium text-purple-300 mb-1">⚡ Fast Pass Queue</div>
                                            <p className="text-xs">
                                                Spend Crystals to skip ahead. Your generation gets priority processing in a separate, faster queue.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2
                        className="text-3xl sm:text-4xl font-medium mb-4"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Ready to create?
                    </h2>
                    <p className="text-gray-400 mb-8">Start with 100 free Gems and 50 Crystals. No credit card required.</p>
                    <Link
                        to={user ? '/home' : '/auth'}
                        className="inline-block bg-yellow-400 text-black px-8 py-4 rounded-full text-base font-semibold hover:bg-yellow-300 transition-all transform hover:scale-105"
                    >
                        {user ? 'Go to Dashboard' : 'Get Started for Free'}
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span>© 2026 Nyxel. All rights reserved.</span>
                    </div>
                    <div className="flex gap-6">
                        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/commerce" className="hover:text-white transition-colors">Commerce</Link>
                        <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
