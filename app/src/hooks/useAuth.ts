import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
}

// Helper to extract display info from a Supabase user
// Priority: custom metadata > Google OAuth data > email fallback
export function getUserDisplayInfo(user: User | null) {
    if (!user) return { displayName: 'User', avatarUrl: null, initial: 'U' };

    const meta = user.user_metadata || {};

    // Display name: custom > Google full_name > email username
    const displayName =
        meta.display_name ||
        meta.full_name ||
        meta.name ||
        user.email?.split('@')[0] ||
        'User';

    // Avatar URL: custom upload > Google avatar > null
    const avatarUrl = meta.custom_avatar_url || meta.avatar_url || null;

    // Initial for fallback avatar circle
    const initial = displayName.charAt(0).toUpperCase();

    return { displayName, avatarUrl, initial };
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

    const signInWithGoogle = useCallback(async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) throw error;
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }, []);

    // Update user profile (display name, avatar URL)
    const updateProfile = useCallback(async (data: { display_name?: string; custom_avatar_url?: string }) => {
        const { error } = await supabase.auth.updateUser({
            data,
        });
        if (error) throw error;
    }, []);

    // Upload avatar to Supabase Storage and update profile
    const uploadAvatar = useCallback(async (file: File) => {
        const user = authState.user;
        if (!user) throw new Error('Not logged in');

        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;

        // Upload to 'avatars' bucket
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Add cache-buster to force refresh
        const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

        // Save to user metadata
        await updateProfile({ custom_avatar_url: urlWithCacheBust });

        return urlWithCacheBust;
    }, [authState.user, updateProfile]);

    return {
        user: authState.user,
        session: authState.session,
        loading: authState.loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
        uploadAvatar,
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
