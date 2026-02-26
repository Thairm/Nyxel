// Stripe Customer Portal — allows users to manage/cancel their subscription
// POST /api/stripe/portal
// Body: { userId: string }
// Returns: { url: string } — redirect user to this URL

import { getSupabaseServer } from '../../lib/supabase-server';

export async function onRequestPost(context: any) {
    const { request, env } = context;

    const stripeSecretKey = env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const serviceKey = env.SUPABASE_SERVICE_KEY;
    if (!serviceKey) {
        return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return new Response(JSON.stringify({ error: 'userId is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Look up the user's Stripe customer ID
        const supabase = getSupabaseServer(serviceKey);
        const { data: sub } = await supabase
            .from('user_subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', userId)
            .single();

        if (!sub?.stripe_customer_id) {
            return new Response(JSON.stringify({ error: 'No active subscription found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Create a Stripe Customer Portal session
        const portalResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                customer: sub.stripe_customer_id,
                return_url: `${new URL(request.url).origin}/home`,
            }).toString(),
        });

        if (!portalResponse.ok) {
            const err = await portalResponse.json().catch(() => ({}));
            console.error('[PORTAL] Stripe error:', err);
            return new Response(JSON.stringify({ error: 'Failed to create portal session' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const portalSession = await portalResponse.json();

        return new Response(JSON.stringify({ url: portalSession.url }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error('[PORTAL] Error:', err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
