// Credit Balance Endpoint
// GET /api/credits/balance?userId=xxx
// Returns: { gems: number, crystals: number }

import { getSupabaseServer } from '../../lib/supabase-server';
import { TIER_CREDITS } from '../../lib/credit-costs';

export async function onRequestGet(context: any) {
    const { request, env } = context;

    const serviceKey = env.SUPABASE_SERVICE_KEY;
    if (!serviceKey) {
        return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
        return new Response(JSON.stringify({ error: 'userId is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const supabase = getSupabaseServer(serviceKey);
        const { data, error } = await supabase
            .from('user_credits')
            .select('gems, crystals')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            // No credit record yet — auto-create one with free tier defaults
            const freeCredits = TIER_CREDITS.free;
            const { data: newRow, error: insertError } = await supabase
                .from('user_credits')
                .upsert({
                    user_id: userId,
                    gems: freeCredits.gems,
                    crystals: freeCredits.crystals,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' })
                .select('gems, crystals')
                .single();

            if (insertError || !newRow) {
                console.error('[CREDITS] Failed to auto-create credit row:', insertError?.message);
                return new Response(JSON.stringify({ gems: freeCredits.gems, crystals: freeCredits.crystals }), {
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            console.log(`[CREDITS] Auto-created free tier credits for user ${userId}: gems=${newRow.gems}, crystals=${newRow.crystals}`);
            return new Response(JSON.stringify({
                gems: newRow.gems,
                crystals: newRow.crystals,
            }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            gems: data.gems,
            crystals: data.crystals,
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error('[CREDITS] Error:', err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
