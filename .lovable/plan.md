

# Add "Retail-Ready" Indicator

## What This Does

When selling to retail stores, they typically need at least a **70% margin** -- meaning your wholesale price should be no more than ~30% of the retail price. This change adds a clear visual indicator showing whether your pricing is retail-ready.

The check: **((Retail Price - Wholesale Price) / Retail Price) >= 70%**

## Changes

### 1. `src/lib/calculations.ts` -- Add helper function

Add `isRetailReady(wholesalePrice, retailPrice, threshold = 70)` that returns whether the retailer's margin meets the threshold, plus the actual retailer margin percentage.

### 2. `src/components/ProductCalculator.tsx` -- Show indicator in pricing summary

Below the wholesale/retail price boxes, add a status banner:
- **Green with checkmark**: "Retail-Ready -- Retailers get X% margin (buying wholesale, selling retail)" when margin is 70% or above
- **Yellow/amber with warning**: "Not Retail-Ready -- Retailers only get X% margin (70%+ recommended)" when below threshold

### 3. `src/components/ProductCard.tsx` -- Show badge on product cards

Add a small colored badge below the pricing row:
- Green "Retail-Ready" badge when the retailer margin is 70%+
- Amber "Low Retail Margin" badge when below, with the actual percentage shown

## What "Retailer Margin" Means Here

This is **not** your margin -- it is the margin a **retail store** would earn if they bought from you at wholesale and sold at your suggested retail price. Retailers typically need 60-70%+ to cover their overhead.

