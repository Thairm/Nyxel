// Stripe Webhook Handler
// Receives events from Stripe and updates Supabase accordingly.
// Handles: checkout.session.completed, invoice.paid, invoice.payment_failed,
//          customer.subscription.updated, customer.subscription.deleted

import { getSupabaseServer } from '../../lib/supabase-server';
import { TIER_CREDITS } from '../../lib/credit-costs';

// ============================================================
// Stripe Signature Verification (without the full stripe SDK)
// ============================================================

async function verifyStripeSignature(
    payload: string,
    sigHeader: string,
    secret: string
): Promise<boolean> {
    const parts = sigHeader.split(',');
    let timestamp = '';
    let signature = '';

    for (const part of parts) {
        const [key, value] = part.split('=');
        if (key === 't') timestamp = value;
        if (key === 'v1') signature = value;
    }

    if (!timestamp || !signature) return false;

    // Check timestamp tolerance (5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) return false;

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
    const expectedSig = Array.from(new Uint8Array(sig))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return expectedSig === signature;
}

// ============================================================
// Stripe API Helper (minimal, no SDK needed)
// ============================================================

async function stripeGet(path: string, secretKey: string): Promise<any> {
    const response = await fetch(`https://api.stripe.com/v1${path}`, {
        headers: { 'Authorization': `Bearer ${secretKey}` },
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`Stripe API error: ${response.status} ${JSON.stringify(err)}`);
    }
    return response.json();
}

// ============================================================
// Tier Detection from Stripe Price
// ============================================================

// Map base subscription prices (in cents) to tier names.
// Only base prices here — coupons are handled by using amount_subtotal or line_items.
const PRICE_TO_TIER: Record<number, string> = {
    499: 'starter',    // $4.99/mo
    999: 'standard',   // $9.99/mo
    1999: 'pro',       // $19.99/mo
    2999: 'ultra',     // $29.99/mo
};

function detectTierFromAmount(amountInCents: number): string | null {
    return PRICE_TO_TIER[amountInCents] || null;
}

async function detectTierFromSession(session: any, stripeSecretKey: string): Promise<string> {
    // 1. Check metadata (most reliable — can be set on Payment Links in Stripe Dashboard)
    if (session.metadata?.tier) {
        console.log(`[WEBHOOK] Tier from metadata: ${session.metadata.tier}`);
        return session.metadata.tier;
    }

    // 2. Fetch line_items from Stripe API — price.unit_amount is coupon-proof
    if (stripeSecretKey && session.id) {
        try {
            const lineItems = await stripeGet(
                `/checkout/sessions/${session.id}/line_items`,
                stripeSecretKey
            );
            const unitAmount = lineItems?.data?.[0]?.price?.unit_amount;
            if (unitAmount) {
                const tier = detectTierFromAmount(unitAmount);
                if (tier) {
                    console.log(`[WEBHOOK] Tier from line_items: ${tier} (unit_amount=${unitAmount})`);
                    return tier;
                }
            }
        } catch (err: any) {
            console.error(`[WEBHOOK] Failed to fetch line_items: ${err.message}`);
        }
    }

    // 3. Fallback: use amount_subtotal (pre-discount price, NOT amount_total)
    const amount = session.amount_subtotal || session.amount_total;
    if (amount) {
        const tier = detectTierFromAmount(amount);
        if (tier) {
            console.log(`[WEBHOOK] Tier from amount_subtotal: ${tier} (amount=${amount})`);
            return tier;
        }
    }

    console.warn(`[WEBHOOK] Could not detect tier, defaulting to starter`);
    return 'starter';
}

// ============================================================
// Event Handlers
// ============================================================

async function handleCheckoutCompleted(session: any, env: any) {
    const serviceKey = env.SUPABASE_SERVICE_KEY;
    if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_KEY');

    const supabase = getSupabaseServer(serviceKey);
    const userId = session.client_reference_id;
    const stripeCustomerId = session.customer;
    const stripeSubscriptionId = session.subscription;

    if (!userId) {
        console.error('[WEBHOOK] No client_reference_id in checkout session — cannot match to user');
        return;
    }

    const tier = await detectTierFromSession(session, env.STRIPE_SECRET_KEY || '');
    console.log(`[WEBHOOK] Checkout completed: user=${userId}, tier=${tier}, customer=${stripeCustomerId}, subtotal=${session.amount_subtotal}, total=${session.amount_total}`);

    // 1. Upsert subscription record
    await supabase
        .from('user_subscriptions')
        .upsert({
            user_id: userId,
            current_tier: tier,
            status: 'active',
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

    // 2. Check if coupon/promo was applied (detect 50% off first month)
    const hasCoupon = session.total_details?.breakdown?.discounts?.length > 0
        || session.discount
        || (session.amount_total && session.amount_subtotal && session.amount_total < session.amount_subtotal);

    if (hasCoupon) {
        // Record promo usage so we don't show 50% off again
        const promoSource = session.metadata?.promo_source || 'website';
        await supabase
            .from('promo_usage')
            .insert({
                user_id: userId,
                tier: tier,
                source: promoSource,
            });
        console.log(`[WEBHOOK] Promo usage recorded: user=${userId}, tier=${tier}, source=${promoSource}`);
    }

    // 3. Allocate initial credits
    const credits = TIER_CREDITS[tier] || TIER_CREDITS.free;
    await supabase
        .from('user_credits')
        .upsert({
            user_id: userId,
            gems: credits.gems,
            crystals: credits.crystals,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

    console.log(`[WEBHOOK] Credits allocated: user=${userId}, gems=${credits.gems}, crystals=${credits.crystals}`);
}

async function handleInvoicePaid(invoice: any, env: any) {
    const serviceKey = env.SUPABASE_SERVICE_KEY;
    if (!serviceKey) return;

    const supabase = getSupabaseServer(serviceKey);
    const stripeCustomerId = invoice.customer;

    // Skip the first invoice (already handled by checkout.session.completed)
    if (invoice.billing_reason === 'subscription_create') {
        console.log('[WEBHOOK] Skipping initial invoice (handled by checkout)');
        return;
    }

    // Look up user by stripe_customer_id
    const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('user_id, current_tier')
        .eq('stripe_customer_id', stripeCustomerId)
        .single();

    if (!sub) {
        console.error(`[WEBHOOK] No subscription found for customer ${stripeCustomerId}`);
        return;
    }

    const tier = sub.current_tier;
    const credits = TIER_CREDITS[tier] || TIER_CREDITS.free;

    // Replenish credits (reset to full monthly allocation)
    await supabase
        .from('user_credits')
        .upsert({
            user_id: sub.user_id,
            gems: credits.gems,
            crystals: credits.crystals,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

    // Ensure subscription status is active
    await supabase
        .from('user_subscriptions')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('user_id', sub.user_id);

    console.log(`[WEBHOOK] Monthly credits replenished: user=${sub.user_id}, tier=${tier}`);
}

async function handleInvoicePaymentFailed(invoice: any, env: any) {
    const serviceKey = env.SUPABASE_SERVICE_KEY;
    if (!serviceKey) return;

    const supabase = getSupabaseServer(serviceKey);
    const stripeCustomerId = invoice.customer;

    const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', stripeCustomerId)
        .single();

    if (!sub) return;

    await supabase
        .from('user_subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('user_id', sub.user_id);

    console.log(`[WEBHOOK] Payment failed, marked past_due: user=${sub.user_id}`);
}

async function handleSubscriptionUpdated(subscription: any, env: any) {
    const serviceKey = env.SUPABASE_SERVICE_KEY;
    if (!serviceKey) return;

    const supabase = getSupabaseServer(serviceKey);
    const stripeCustomerId = subscription.customer;

    const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', stripeCustomerId)
        .single();

    if (!sub) return;

    // Map Stripe status to our status
    const statusMap: Record<string, string> = {
        active: 'active',
        past_due: 'past_due',
        canceled: 'cancelled',
        unpaid: 'past_due',
        trialing: 'active',
    };
    const newStatus = statusMap[subscription.status] || subscription.status;

    // Detect tier from plan amount if subscription changed tier
    const amount = subscription.items?.data?.[0]?.price?.unit_amount;
    const newTier = amount ? detectTierFromAmount(amount) : null;

    const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
    };
    if (newTier) updateData.current_tier = newTier;

    await supabase
        .from('user_subscriptions')
        .update(updateData)
        .eq('user_id', sub.user_id);

    // If tier changed, update credits too
    if (newTier) {
        const credits = TIER_CREDITS[newTier] || TIER_CREDITS.free;
        await supabase
            .from('user_credits')
            .upsert({
                user_id: sub.user_id,
                gems: credits.gems,
                crystals: credits.crystals,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
    }

    console.log(`[WEBHOOK] Subscription updated: user=${sub.user_id}, status=${newStatus}, tier=${newTier || 'unchanged'}`);
}

async function handleSubscriptionDeleted(subscription: any, env: any) {
    const serviceKey = env.SUPABASE_SERVICE_KEY;
    if (!serviceKey) return;

    const supabase = getSupabaseServer(serviceKey);
    const stripeCustomerId = subscription.customer;

    const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', stripeCustomerId)
        .single();

    if (!sub) return;

    // Mark subscription as cancelled
    await supabase
        .from('user_subscriptions')
        .update({
            status: 'cancelled',
            current_tier: null,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', sub.user_id);

    // Reset credits to free tier
    const freeCredits = TIER_CREDITS.free;
    await supabase
        .from('user_credits')
        .upsert({
            user_id: sub.user_id,
            gems: freeCredits.gems,
            crystals: freeCredits.crystals,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

    console.log(`[WEBHOOK] Subscription cancelled: user=${sub.user_id}, reset to free tier`);
}

// ============================================================
// Main Webhook Handler
// ============================================================

export async function onRequestPost(context: any) {
    const { request, env } = context;

    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('[WEBHOOK] Missing STRIPE_WEBHOOK_SECRET');
        return new Response('Webhook secret not configured', { status: 500 });
    }

    // Read raw body for signature verification
    const payload = await request.text();
    const sigHeader = request.headers.get('stripe-signature');

    if (!sigHeader) {
        return new Response('Missing stripe-signature header', { status: 400 });
    }

    // Verify signature
    const isValid = await verifyStripeSignature(payload, sigHeader, webhookSecret);
    if (!isValid) {
        console.error('[WEBHOOK] Invalid signature');
        return new Response('Invalid signature', { status: 400 });
    }

    // Parse event
    let event: any;
    try {
        event = JSON.parse(payload);
    } catch {
        return new Response('Invalid JSON', { status: 400 });
    }

    console.log(`[WEBHOOK] Received event: ${event.type} (id: ${event.id})`);

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object, env);
                break;

            case 'invoice.paid':
                await handleInvoicePaid(event.data.object, env);
                break;

            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object, env);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object, env);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object, env);
                break;

            default:
                console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
        }
    } catch (err: any) {
        console.error(`[WEBHOOK] Error handling ${event.type}:`, err.message);
        // Return 200 anyway to prevent Stripe from retrying
        // (errors are logged, we don't want infinite retries)
    }

    // Always return 200 to acknowledge receipt
    return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
