

## Public Landing Page

### Overview
Create a public-facing marketing landing page at `/landing` that unauthenticated visitors see. This page will showcase the product, highlight key features, and drive signups -- the first step toward making this a sellable SaaS product.

### Route Changes
- Add a new `/landing` route in `App.tsx` (no AuthGuard)
- Redirect unauthenticated users from `/` to `/landing` (or make `/landing` the default entry point)
- Keep `/auth` for login/signup, but add CTA buttons on the landing page that link to `/auth`

### Landing Page Sections

**1. Hero Section**
- Bold headline: "Know Your True Cost. Set Profitable Prices."
- Subheadline explaining the value for home fragrance / small product businesses
- Two CTA buttons: "Get Started Free" (links to `/auth` in signup mode) and "See How It Works" (scrolls down)
- Visual: the app's warm amber/terracotta brand identity

**2. Features Grid (3-4 cards)**
- **COGS Calculator** -- Build product formulas, calculate true cost per unit
- **Pricing Engine** -- Set wholesale and retail prices with margin visibility
- **Retail Store Tracking** -- Log sales per store, see which locations perform best
- **Materials Library** -- Save materials once, reuse across all products

**3. How It Works (3 steps)**
1. Add your materials and costs
2. Build product formulas and calculate COGS
3. Track sales and optimize pricing

**4. Social Proof / Stats Section**
- Placeholder metrics: "Calculate margins in seconds", "Track unlimited products", "Monitor retail partner performance"

**5. Final CTA**
- "Ready to stop guessing your margins?" with a signup button

**6. Simple Footer**
- App name, copyright, link to login

### New File
- `src/pages/Landing.tsx` -- the full landing page component (no Layout wrapper, standalone design)

### Files to Edit
- `src/App.tsx` -- add `/landing` route, update root `/` to redirect to landing for unauthenticated users
- `src/components/AuthGuard.tsx` -- change redirect from `/auth` to `/landing` when not logged in

### Design Approach
- Uses existing design tokens (warm amber primary, Playfair Display headings, Inter body text)
- Fully responsive with mobile-first layout
- Smooth scroll-based animations using existing `animate-fade-in` classes
- No new dependencies required

