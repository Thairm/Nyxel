import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, CheckCircle2, PartyPopper } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function SuccessPage() {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [recorded, setRecorded] = useState(false);
    const tier = searchParams.get('tier');
    const usedPromo = searchParams.get('promo') === 'true';

    useEffect(() => {
        // Record subscription + promo usage in Supabase
        if (user && tier && !recorded) {
            const recordSubscription = async () => {
                // Upsert subscription status
                await supabase
                    .from('user_subscriptions')
                    .upsert(
                        {
                            user_id: user.id,
                            current_tier: tier,
                            status: 'active',
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: 'user_id' }
                    );

                // Record promo usage ONLY if they actually used a promo code
                if (usedPromo) {
                    await supabase
                        .from('promo_usage')
                        .insert({
                            user_id: user.id,
                            tier: tier,
                        });
                }

                setRecorded(true);
            };
            recordSubscription();
        }
    }, [user, tier, usedPromo, recorded]);

    return (
        <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center px-6">
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

            <div className="max-w-md text-center">
                <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <PartyPopper className="absolute top-0 right-1/3 w-6 h-6 text-yellow-400 animate-bounce" />
                </div>

                <h1
                    className="text-3xl font-medium mb-3"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Welcome to Nyxel!
                </h1>
                <p className="text-gray-400 mb-2">
                    Your subscription is now active.
                    {tier && (
                        <span className="text-yellow-400 font-medium">
                            {' '}You're on the {tier.charAt(0).toUpperCase() + tier.slice(1)} plan.
                        </span>
                    )}
                </p>
                <p className="text-sm text-gray-500 mb-8">
                    Your credits have been loaded into your account. Start creating now!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/home"
                        className="bg-yellow-400 text-black px-6 py-3 rounded-full text-sm font-semibold hover:bg-yellow-300 transition-colors"
                    >
                        Start Creating
                    </Link>
                    <Link
                        to="/pricing"
                        className="bg-white/10 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/20 border border-white/20 transition-colors"
                    >
                        View Plans
                    </Link>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    Powered by Stripe • Secure payments
                </div>
            </div>
        </div>
    );
}
