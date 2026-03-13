import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Diamond, Zap, ArrowLeft, Info, LogIn, LogOut, Tag, Gift, Crown } from 'lucide-react';
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

// Crystal amounts per tier
const STARTER_CRYSTALS = 5000;
const STANDARD_CRYSTALS = 10000;
const PRO_CRYSTALS = 10000;

// ============================================================
// SOCIAL MEDIA PROMO CODES
// These codes are OUR codes — do NOT create them in Stripe.
// Each one gives +1,000 bonus crystals when subscribing.
// Add one code per social media account below.
// ============================================================
const SOCIAL_PROMO_CODES = new Set([
    'NYXELTIKTOK',
    'NYXELINSTA',
    'NYXELYT',
    // Add more per platform as needed
]);

// ============================================================
// STRIPE 33% COUPON CODE
// Replace PLACEHOLDER_33_COUPON with your actual Stripe coupon
// code after creating a 33% first-month coupon in the Stripe
// Dashboard → Coupons.
// ============================================================
const STRIPE_33_COUPON = 'Nyxel33OFFF1STMTWARLA';

// ============================================================
// STRIPE PAYMENT LINKS
// • default = full-price payment link
// • promo   = same link with ?prefilled_promo_code=33_COUPON
//   (swap PLACEHOLDER_33_COUPON once created in Stripe)
//
// PRO LINKS: create a $14.99/mo product in Stripe, generate
// payment links, then replace the PLACEHOLDER values below.
// ============================================================
const tiers: PricingTier[] = [
    {
        id: 'starter',
        name: 'Starter',
        price: '$4.99',
        priceNum: 4.99,
        promoPrice: '$3.34',
        gems: 0,  // Gems hidden — backend still tracks this
        crystals: STARTER_CRYSTALS,
        icon: <Diamond className="w-6 h-6" />,
        features: [
            'Everything in Free',
            `${STARTER_CRYSTALS.toLocaleString()} Crystals / month`,
            '~500 images / month',
            'Crystal fast-pass queue',
            'Priority support',
        ],
        links: {
            default: 'https://buy.stripe.com/9B69AT1Dx1C0gD3eGE7g404',
            promo: `https://buy.stripe.com/5kQaEXfunbcA9aBgOM7g405?prefilled_promo_code=${STRIPE_33_COUPON}`,
        },
    },
    {
        id: 'standard',
        name: 'Standard',
        price: '$9.99',
        priceNum: 9.99,
        promoPrice: '$6.69',
        gems: 0,  // Gems hidden — backend still tracks this
        crystals: STANDARD_CRYSTALS,
        icon: <Zap className="w-6 h-6" />,
        highlight: true,
        badge: 'Best Value',
        features: [
            'Everything in Starter',
            `${STANDARD_CRYSTALS.toLocaleString()} Crystals / month`,
            '~1,000 images / month',
            'Crystal fast-pass queue',
        ],
        links: {
            default: 'https://buy.stripe.com/00wcN5fun2G42Mdbus7g406',
            promo: `https://buy.stripe.com/dRm6oHbe75SgaeF4207g407?prefilled_promo_code=${STRIPE_33_COUPON}`,
        },
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$14.99',
        priceNum: 14.99,
        promoPrice: '$10.04',
        gems: 0,  // Gems hidden — backend still tracks this
        crystals: PRO_CRYSTALS,
        icon: <Crown className="w-6 h-6" />,
        badge: 'Best Power',
        features: [
            'Everything in Standard',
            `${PRO_CRYSTALS.toLocaleString()} Crystals / month`,
            '~1,000 images / month',
            'Free Generation mode ✨',
            'Highest priority queue ⚡',
            'Crystal fast-pass queue',
        ],
        links: {
            default: 'https://buy.stripe.com/00weVdfuna8waeF7ec7g40d',
            promo: `https://buy.stripe.com/00weVdfuna8waeF7ec7g40d?prefilled_promo_code=${STRIPE_33_COUPON}`,
        },
    },
];

const modelCosts = [
    { name: 'Nyxel V1.0', type: 'Crystals', cost: 10, description: 'Anime & illustration model' },
];

export default function PricingPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { promoUsed, currentTier, loading: promoLoading } = usePromoStatus();
    const [promoCode, setPromoCode] = useState('');
    const [promoError, setPromoError] = useState('');
    // Combined tier+discount selection: e.g. 'standard' = full price, 'standard_promo' = 33% off
    const [promoSelection, setPromoSelection] = useState('standard_promo');
    const [portalLoading, setPortalLoading] = useState(false);

    const isLoading = authLoading || promoLoading;

    // Flat list of options for the promo selector: one full-price + one 33%-off per tier
    const promoOptions = tiers.flatMap(t => [
        { value: t.id,              label: `${t.name} — ${t.price}/mo`,              usePromo: false },
        { value: `${t.id}_promo`,   label: `${t.name} (33% off) — ${t.promoPrice}/mo`, usePromo: true },
    ]);

    // Handle promo code / social code submission
    const handlePromoSubmit = () => {
        const code = promoCode.trim().toUpperCase();
        const isSocialCode = code.length > 0;

        if (!user) {
            if (isSocialCode) localStorage.setItem('pendingPromoCode', code);
            localStorage.setItem('pendingPromoSelection', promoSelection);
            window.location.href = '/auth';
            return;
        }

        // Validate social code if entered — must be in our set
        let isSocial = false;
        if (isSocialCode) {
            if (!SOCIAL_PROMO_CODES.has(code)) {
                setPromoError('Invalid promo code.');
                return;
            }
            if (currentTier && (TIER_ORDER[currentTier] || 0) > 0) {
                setPromoError('This code is for new subscribers only.');
                return;
            }
            isSocial = true;
        }

        const tierId = promoSelection.replace('_promo', '');
        const useDiscount = promoSelection.endsWith('_promo');
        const selectedTier = tiers.find(t => t.id === tierId);
        if (!selectedTier) { setPromoError('Please select a valid plan.'); return; }

        setPromoError('');
        const base = selectedTier.links.default;
        const params: string[] = [];
        if (useDiscount) params.push(`prefilled_promo_code=${STRIPE_33_COUPON}`);
        // Append _SOCIAL to client_reference_id so webhook awards +1,000 crystal bonus
        const ref = isSocial ? `${user.id}_SOCIAL` : user.id;
        params.push(`client_reference_id=${ref}`);
        window.location.href = `${base}?${params.join('&')}`;
    };

    // Determine which link to use for a tier card button
    const getLinkForTier = (tier: PricingTier) => {
        if (!user) return tier.links.promo; // Not logged in = show promo (they'll sign up first)
        // Subscribed: only show promo for tiers ABOVE current
        if (currentTier && (TIER_ORDER[tier.id] || 0) <= (TIER_ORDER[currentTier] || 0)) {
            return tier.links.default;
        }
        if (promoUsed[tier.id]) return tier.links.default; // Already used promo
        return tier.links.promo; // Eligible for promo
    };

    // Show all tiers regardless of current subscription
    const shouldShowTier = (_tier: PricingTier) => true;

    // Check if promo is available for this tier
    const isPromoAvailable = (tier: PricingTier) => {
        if (!user) return true; // Assume new user
        // Subscribed: promo only for tiers ABOVE current
        if (currentTier && (TIER_ORDER[tier.id] || 0) <= (TIER_ORDER[currentTier] || 0)) {
            return false;
        }
        return !promoUsed[tier.id];
    };

    // Helper: is this the user's current tier?
    const isCurrentTier = (tier: PricingTier) => currentTier === tier.id;

    // Helper: is this tier lower than user's current tier?
    const isLowerTier = (tier: PricingTier) => {
        if (!currentTier) return false;
        return (TIER_ORDER[tier.id] || 0) < (TIER_ORDER[currentTier] || 0);
    };

    // Handle subscribe click — appends client_reference_id for webhook matching
    const handleSubscribeClick = (tier: PricingTier) => {
        if (!user) {
            window.location.href = '/auth';
            return;
        }
        const link = getLinkForTier(tier);
        // Append client_reference_id so Stripe webhook can match this payment to the Supabase user
        const separator = link.includes('?') ? '&' : '?';
        window.location.href = `${link}${separator}client_reference_id=${user.id}`;
    };

    // Handle Manage Subscription — opens Stripe Customer Portal
    const handleManageSubscription = async () => {
        if (!user) return;
        setPortalLoading(true);
        try {
            const response = await fetch('/api/stripe/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Failed to open subscription management');
            }
        } catch (err) {
            alert('Failed to connect to subscription portal');
        } finally {
            setPortalLoading(false);
        }
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

            {/* Promo Banner — hide for Ultra users (no higher tier to upgrade to) */}
            {(!currentTier || currentTier !== 'ultra') && (
                <div className="bg-gradient-to-r from-yellow-400/20 via-yellow-400/10 to-yellow-400/20 border-b border-yellow-400/20">
                    <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center gap-3">
                        <Tag className="w-4 h-4 text-yellow-400" />
                        <p className="text-sm text-center">
                            <span className="font-semibold text-yellow-400">🎉 Launch Special:</span>
                            <span className="text-gray-300 ml-1">33% off your first month on all plans!</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Hero */}
            <section className="pt-16 pb-8 px-6 relative">
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
                        <div className="flex flex-col items-center gap-3 mt-2 mb-4">
                            <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-4 py-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-sm text-emerald-400">
                                    You're on the <strong>{currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</strong> plan
                                </span>
                            </div>
                            <button
                                onClick={handleManageSubscription}
                                disabled={portalLoading}
                                className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer disabled:opacity-50"
                            >
                                {portalLoading ? 'Opening...' : 'Manage / Cancel Subscription'}
                            </button>
                        </div>
                    )}

                    {/* Credit Explainer — Crystals only */}
                    <div className="flex flex-wrap justify-center gap-6 mt-6">
                        <div className="flex items-center gap-3 bg-purple-400/10 border border-purple-400/20 rounded-full px-5 py-2.5">
                            <div className="w-3 h-3 rounded-full bg-purple-400" />
                            <span className="text-sm">
                                <strong className="text-purple-400">Crystals</strong>
                                <span className="text-gray-400 ml-1">— 10 per image generated</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Promo Code Card — positioned on the right (desktop) */}
                <div className="hidden lg:block absolute top-16 right-4 xl:right-8 2xl:right-[calc((100%-1280px)/2)]">
                    <div className="w-72 rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <Gift className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-sm font-semibold">Have a promo code?</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            Enter a social media code for +1,000 bonus crystals
                        </p>
                        {/* Social code input */}
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handlePromoSubmit()}
                            placeholder="Social code (optional)"
                            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 transition-colors mb-3"
                        />
                        {/* Plan + discount selector */}
                        <select
                            value={promoSelection}
                            onChange={(e) => setPromoSelection(e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400/50 transition-colors mb-3 appearance-none"
                        >
                            {promoOptions.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handlePromoSubmit}
                            className="w-full bg-yellow-400 text-black py-2.5 rounded-xl text-sm font-semibold hover:bg-yellow-300 transition-colors cursor-pointer"
                        >
                            Apply & Subscribe
                        </button>
                        {promoError && (
                            <p className="text-red-400 text-xs mt-2 text-center">{promoError}</p>
                        )}
                        <p className="text-xs text-gray-600 mt-3 text-center">
                            Select a "33% off" option to combine both benefits
                        </p>
                    </div>
                </div>

                {/* Mobile Promo Code (shown below hero on smaller screens) */}
                <div className="lg:hidden mt-8 max-w-sm mx-auto">
                    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <Gift className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-sm font-semibold">Have a promo code?</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            Enter a social media code for +1,000 bonus crystals
                        </p>
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handlePromoSubmit()}
                            placeholder="Social code (optional)"
                            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 transition-colors mb-3"
                        />
                        <div className="flex gap-2">
                            <select
                                value={promoSelection}
                                onChange={(e) => setPromoSelection(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400/50 transition-colors appearance-none"
                            >
                                {promoOptions.map(opt => (
                                    <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handlePromoSubmit}
                                className="bg-yellow-400 text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-yellow-300 transition-colors cursor-pointer"
                            >
                                Apply
                            </button>
                        </div>
                        {promoError && (
                            <p className="text-red-400 text-xs mt-2 text-center">{promoError}</p>
                        )}
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
                                    50 Crystals per month · ~5 images. No credit card required.
                                </p>
                            </div>
                            <Link
                                to={user ? '/generate' : '/auth'}
                                className="bg-white/10 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-white/20 border border-white/20 transition-colors"
                            >
                                {user ? 'Start Creating' : 'Create Free Account'}
                            </Link>
                        </div>
                    </div>

                    {/* Paid Tiers */}
                    {isLoading ? (
                        <div className="text-center py-16 text-gray-500">Loading plans...</div>
                    ) : (
                        <div className="flex flex-wrap gap-5 justify-center">
                            {visibleTiers.map((tier) => {
                                const promoAvailable = isPromoAvailable(tier);

                                return (
                                    <div
                                        key={tier.name}
                                        className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${
                                            isCurrentTier(tier)
                                                ? 'bg-gradient-to-b from-emerald-400/15 to-emerald-400/5 border-2 border-emerald-400/40 shadow-[0_0_40px_-8px_rgba(52,211,153,0.2)]'
                                                : tier.id === 'pro'
                                                    ? 'bg-gradient-to-b from-purple-400/15 to-purple-400/5 border-2 border-purple-400/40 shadow-[0_0_40px_-8px_rgba(192,132,252,0.2)]'
                                                    : tier.highlight
                                                        ? 'bg-gradient-to-b from-yellow-400/15 to-yellow-400/5 border-2 border-yellow-400/40 shadow-[0_0_40px_-8px_rgba(250,204,21,0.2)]'
                                                        : 'bg-white/[0.03] border border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        {/* Badge */}
                                        {isCurrentTier(tier) ? (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400 text-black">
                                                Current Plan
                                            </div>
                                        ) : tier.badge ? (
                                            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${
                                                tier.id === 'pro'
                                                    ? 'bg-purple-400 text-black'
                                                    : tier.highlight
                                                        ? 'bg-yellow-400 text-black'
                                                        : 'bg-white/10 text-yellow-400 border border-yellow-400/30'
                                            }`}>
                                                {tier.badge}
                                            </div>
                                        ) : null}

                                        {/* Icon */}
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                                            tier.id === 'pro'
                                                ? 'bg-purple-400 text-black'
                                                : tier.highlight
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
                                                33% off first month!
                                            </div>
                                        )}
                                        {!promoAvailable && <div className="mb-4" />}

                                        {/* Credits — Crystals only */}
                                        <div className="flex flex-col gap-2 mb-5 pb-5 border-b border-white/10">
                                            <div className="flex items-center justify-between bg-purple-400/5 rounded-lg px-3 py-2">
                                                <span className="text-xs text-gray-400">Crystals / month</span>
                                                <span className="text-sm font-semibold text-purple-400">{tier.crystals.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-2.5 mb-6 flex-1">
                                            {tier.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
                                                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                                        tier.id === 'pro'
                                                            ? 'text-purple-400'
                                                            : tier.highlight
                                                                ? 'text-yellow-400'
                                                                : 'text-emerald-400'
                                                    }`} />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA */}
                                        <button
                                            onClick={() => handleSubscribeClick(tier)}
                                            disabled={isCurrentTier(tier)}
                                            className={`w-full py-3 rounded-full text-sm font-semibold transition-all ${
                                                isCurrentTier(tier)
                                                    ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 cursor-default'
                                                    : isLowerTier(tier)
                                                        ? 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10 cursor-pointer'
                                                        : tier.id === 'pro'
                                                            ? 'bg-purple-400 text-black hover:bg-purple-300 cursor-pointer'
                                                            : tier.highlight
                                                                ? 'bg-yellow-400 text-black hover:bg-yellow-300 cursor-pointer'
                                                                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 cursor-pointer'
                                            }`}
                                        >
                                            {!user
                                                ? 'Sign Up & Subscribe'
                                                : isCurrentTier(tier)
                                                    ? 'Current Plan'
                                                    : isLowerTier(tier)
                                                        ? 'Change Plan'
                                                        : 'Upgrade'
                                            }
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

            {/* Queue / Free Gen Explainer */}
            <section className="py-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center flex-shrink-0">
                                <Info className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">How Crystals Work</h3>
                                <div className="space-y-3 text-sm text-gray-400">
                                    <p>
                                        Each image generation costs <strong className="text-white">10 Crystals</strong>. Crystals refresh monthly with your plan.
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-xl p-4">
                                            <div className="font-medium text-white mb-1">⚡ Priority Queue</div>
                                            <p className="text-xs">
                                                Paid subscribers use the Crystal fast-pass queue. Pro subscribers get the highest priority for the fastest generation times.
                                            </p>
                                        </div>
                                        <div className="bg-purple-400/5 border border-purple-400/10 rounded-xl p-4">
                                            <div className="font-medium text-purple-300 mb-1">✨ Free Generation</div>
                                            <p className="text-xs">
                                                Pro plan users can generate select models without spending Crystals using Free Generation mode.
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
                    <p className="text-gray-400 mb-8">Start with 50 free Crystals. No credit card required.</p>
                    <Link
                        to={user ? '/generate' : '/auth'}
                        className="inline-block bg-yellow-400 text-black px-8 py-4 rounded-full text-base font-semibold hover:bg-yellow-300 transition-all transform hover:scale-105"
                    >
                        {user ? 'Start Creating' : 'Get Started for Free'}
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
                        <span className="text-gray-600 cursor-default">Commerce</span>
                        <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
