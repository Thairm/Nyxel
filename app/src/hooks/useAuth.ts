import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        session: null,
        loading: true,
    });

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setAuthState({
                user: session?.user ?? null,
                session,
                loading: false,
            });
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setAuthState({
                    user: session?.user ?? null,
                    session,
                    loading: false,
                });
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signUp = useCallback(async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }, []);

    return {
        user: authState.user,
        session: authState.session,
        loading: authState.loading,
        signUp,
        signIn,
        signOut,
    };
}

// Hook to check promo usage for the current user
export function usePromoStatus() {
    const { user } = useAuth();
    const [promoUsed, setPromoUsed] = useState<Record<string, boolean>>({});
    const [currentTier, setCurrentTier] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setPromoUsed({});
            setCurrentTier(null);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);

            // Check promo usage
            const { data: promos } = await supabase
                .from('promo_usage')
                .select('tier')
                .eq('user_id', user.id);

            const used: Record<string, boolean> = {};
            promos?.forEach((p) => {
                used[p.tier] = true;
            });
            setPromoUsed(used);

            // Check current subscription
            const { data: sub } = await supabase
                .from('user_subscriptions')
                .select('current_tier, status')
                .eq('user_id', user.id)
                .single();

            if (sub && sub.status === 'active') {
                setCurrentTier(sub.current_tier);
            } else {
                setCurrentTier(null);
            }

            setLoading(false);
        };

        fetchData();
    }, [user]);

    // Record that user clicked a promo link for a tier
    const recordPromoUse = useCallback(
        async (tier: string) => {
            if (!user) return;
            await supabase.from('promo_usage').insert({
                user_id: user.id,
                tier,
            });
            setPromoUsed((prev) => ({ ...prev, [tier]: true }));
        },
        [user]
    );

    return { promoUsed, currentTier, loading, recordPromoUse };
}
