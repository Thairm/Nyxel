---
description: How to add a new social media promo code to the Nyxel pricing page
---

# Add a Social Media Promo Code

This workflow adds a new promo/coupon code that users can enter on the pricing page to get a discount.

## How the System Works

- The pricing page (`app/src/pages/PricingPage.tsx`) has a **promo code input card** on the right side of the hero section
- Users type a code → the site validates it against `SOCIAL_PROMO_CODES` map → redirects to the correct Stripe payment link
- After payment, Stripe redirects to `/success?tier=TIER&promo=social`
- The success page (`app/src/pages/SuccessPage.tsx`) records the promo usage in Supabase with `source: 'social_media'`
- Each tier's subscribe button already uses a **different** payment link (with promo auto-prefilled via `?prefilled_promo_code=XXX`) — this is separate from the social media promo code input

## Key Files

- `app/src/pages/PricingPage.tsx` — Contains `SOCIAL_PROMO_CODES` map (around line 7-14)
- `app/src/pages/SuccessPage.tsx` — Records promo usage with source tracking
- `app/src/lib/supabase.ts` — Supabase client
- `app/src/hooks/useAuth.ts` — Auth hook with `usePromoStatus`

## Steps to Add a New Code

### 1. Create a Coupon in Stripe Dashboard
- Go to **Products → Coupons → + New**
- Set the discount (e.g., 100% off, 50% off)
- Set duration (e.g., "Once" for first month only)
- Create a **promotion code** for this coupon (e.g., `YOUTUBE100randomsuffix`)

### 2. Create a Payment Link in Stripe Dashboard
- Go to **Payment Links → + New**
- Select the product (e.g., "Nyxel Standard $9.99/month")
- In **After payment** tab → select "Don't show confirmation page"
- Set the success URL to: `https://nyxel-ten.vercel.app/success?tier=TIER&promo=social`
  - Replace TIER with: `starter`, `standard`, `pro`, or `ultra`
- Click **Create link**

### 3. Add the Code to PricingPage.tsx
// turbo
Open `app/src/pages/PricingPage.tsx` and find the `SOCIAL_PROMO_CODES` map near the top of the file. Add a new entry:

```typescript
const SOCIAL_PROMO_CODES: Record<string, string> = {
    'STANDARD100': 'https://buy.stripe.com/14A14nfuna8w3QhdCA7g40c?prefilled_promo_code=STANDARD100qpwrpesmcvpogsak',
    'YOUTUBE100': 'https://buy.stripe.com/YOUR_NEW_LINK?prefilled_promo_code=YOUR_STRIPE_PROMO_CODE',
    // The KEY is what users type (case-insensitive)
    // The VALUE is the full Stripe payment link URL with prefilled promo code
};
```

**Important:** The key (e.g., `YOUTUBE100`) is what users type on the website. It is matched **case-insensitively** (the code converts input to uppercase). The value is the full Stripe payment link URL including `?prefilled_promo_code=...` parameter.

### 4. Build, Commit, Push
// turbo
```
cd app && npx tsc -b
cd .. && git add -A && git commit -m "feat: add YOUTUBE100 social promo code" && git push origin main
```

## Existing Payment Links (as of Feb 2026)

| # | Name | URL |
|---|------|-----|
| 1 | Starter default | `https://buy.stripe.com/9B69AT1Dx1C0gD3eGE7g404` |
| 2 | Starter promo (50%) | `https://buy.stripe.com/5kQaEXfunbcA9aBgOM7g405?prefilled_promo_code=STARTER50cwgdfmvmvtiwerfx` |
| 3 | Standard default | `https://buy.stripe.com/00wcN5fun2G42Mdbus7g406` |
| 4 | Standard promo (50%) | `https://buy.stripe.com/dRm6oHbe75SgaeF4207g407?prefilled_promo_code=STANDARD50caefmcprgasmcakl` |
| 5 | Pro default | `https://buy.stripe.com/eVq9AT81V80oeuVaqo7g408` |
| 6 | Pro promo (50%) | `https://buy.stripe.com/cNieVd3LF2G4aeF5647g409?prefilled_promo_code=PRO50mcpaefakqwerflff` |
| 7 | Ultra default | `https://buy.stripe.com/dRm3cv3LF3K886xcyw7g40a` |
| 8 | Ultra promo (50%) | `https://buy.stripe.com/00w7sL0ztcgE5Yp7ec7g40b?prefilled_promo_code=ULTRA50ratglamfesgfqwer` |
| 9 | Standard social (100%) | `https://buy.stripe.com/14A14nfuna8w3QhdCA7g40c?prefilled_promo_code=STANDARD100qpwrpesmcvpogsak` |

## Supabase Tables

- `promo_usage` — columns: `id`, `user_id`, `tier`, `source` (website/social_media), `used_at`
- `user_subscriptions` — columns: `id`, `user_id`, `current_tier`, `status`, `updated_at`
- Both tables have Row Level Security enabled

## Success URL Pattern

- Default (no promo): `?tier=TIER`
- Website promo (50% off, auto via tier buttons): `?tier=TIER&promo=true`
- Social media promo (from code input): `?tier=TIER&promo=social`
