import { Link } from 'react-router-dom';
import { Check, Sparkles, Gem, Diamond, Zap, Crown, ArrowLeft, Info } from 'lucide-react';

interface PricingTier {
    name: string;
    price: string;
    priceNum: number;
    gems: number;
    crystals: number;
    features: string[];
    highlight?: boolean;
    badge?: string;
    icon: React.ReactNode;
    ctaText: string;
    ctaLink: string;
}

const tiers: PricingTier[] = [
    {
        name: 'Free',
        price: '$0',
        priceNum: 0,
        gems: 100,
        crystals: 50,
        icon: <Sparkles className="w-6 h-6" />,
        features: [
            'Access to all AI models',
            '100 Gems / month',
            '50 Crystals / month',
            'Standard queue',
            'Community support',
        ],
        ctaText: 'Get Started',
        ctaLink: '/home',
    },
    {
        name: 'Starter',
        price: '$4.99',
        priceNum: 4.99,
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
        ctaText: 'Subscribe',
        ctaLink: '#', // Replace with Stripe Payment Link
    },
    {
        name: 'Standard',
        price: '$9.99',
        priceNum: 9.99,
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
        ctaText: 'Subscribe',
        ctaLink: '#', // Replace with Stripe Payment Link
    },
    {
        name: 'Pro',
        price: '$19.99',
        priceNum: 19.99,
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
        ctaText: 'Subscribe',
        ctaLink: '#', // Replace with Stripe Payment Link
    },
    {
        name: 'Ultra',
        price: '$29.99',
        priceNum: 29.99,
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
        ctaText: 'Subscribe',
        ctaLink: '#', // Replace with Stripe Payment Link
    },
];

const modelCosts = [
    { name: 'Nano Banana Pro', type: 'Gems', cost: 100, description: 'Premium API model' },
    { name: 'Z Image', type: 'Crystals', cost: 20, description: 'Community model' },
    { name: 'SDXL Models', type: 'Crystals', cost: 10, description: 'Community model' },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Google Fonts */}
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
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-20 pb-8 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1
                        className="text-4xl sm:text-5xl md:text-6xl font-medium mb-4 tracking-tight"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Simple, transparent{' '}
                        <span className="text-yellow-400">pricing</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-4">
                        Choose the plan that fits your creative needs. Upgrade or cancel anytime.
                    </p>

                    {/* Credit Explainer */}
                    <div className="flex flex-wrap justify-center gap-6 mt-8">
                        <div className="flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-5 py-2.5">
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <span className="text-sm">
                                <strong className="text-yellow-400">Gems</strong>
                                <span className="text-gray-400 ml-1">— for premium API models</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-3 bg-purple-400/10 border border-purple-400/20 rounded-full px-5 py-2.5">
                            <div className="w-3 h-3 rounded-full bg-purple-400" />
                            <span className="text-sm">
                                <strong className="text-purple-400">Crystals</strong>
                                <span className="text-gray-400 ml-1">— for community models</span>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 xl:gap-5">
                        {tiers.map((tier) => (
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
                                <div className="mb-5">
                                    <span className="text-3xl font-bold">{tier.price}</span>
                                    {tier.priceNum > 0 && (
                                        <span className="text-gray-500 text-sm ml-1">/ month</span>
                                    )}
                                </div>

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
                                {tier.ctaLink.startsWith('/') ? (
                                    <Link
                                        to={tier.ctaLink}
                                        className={`w-full block text-center py-3 rounded-full text-sm font-semibold transition-all ${tier.highlight
                                                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                                                : tier.priceNum === 0
                                                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                            }`}
                                    >
                                        {tier.ctaText}
                                    </Link>
                                ) : (
                                    <a
                                        href={tier.ctaLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full block text-center py-3 rounded-full text-sm font-semibold transition-all ${tier.highlight
                                                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                                                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                            }`}
                                    >
                                        {tier.ctaText}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
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
                                        }`}
                                    >
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
                        to="/home"
                        className="inline-block bg-yellow-400 text-black px-8 py-4 rounded-full text-base font-semibold hover:bg-yellow-300 transition-all transform hover:scale-105"
                    >
                        Get Started for Free
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
