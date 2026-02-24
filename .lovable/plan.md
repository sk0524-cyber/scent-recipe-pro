

# Configurable Retailer Margin Target

## What Changes

Replace the hardcoded 70% retailer margin with a user-adjustable slider/input so you can set the target margin per product (e.g., 45%, 50%, 60%, 70%).

## How It Works

A new input field appears near the wholesale markup section in the calculator. You set your target retailer margin (default 70%), and this value flows through to:
- The "Retail-Ready" button calculation
- The "Retailer Shelf Price" display
- The "Retail-Ready" / "Low Retail Margin" indicator
- The tooltip and helper text

On product cards, the saved margin is used instead of a fixed 70%.

## Technical Details

### 1. Database: Add `retailer_margin_target` column to `products` table

- New column `retailer_margin_target` (numeric, default 70, not null)
- No migration needed for existing products since default covers them

### 2. `src/hooks/useProducts.ts`

- Add `retailer_margin_target` to `ProductFormData` and `ProductWithItems` types
- Include in create/update mutations and queries

### 3. `src/components/ProductCalculator.tsx`

- Add a `retailer_margin_target` form field (number input, 30-90 range) near the wholesale markup section, labeled "Target Retailer Margin (%)"
- Pass this value to `calculateRetailReadyWholesaleMarkup(retailMarkup, targetMargin)` when the Retail-Ready button is clicked
- Pass to `calculateRetailerShelfPrice(wholesalePrice, targetMargin)` for shelf price display
- Pass to `isRetailReady(wholesalePrice, retailPrice, targetMargin)` for the indicator
- Update helper text from "Based on 70% retailer margin" to show actual value

### 4. `src/components/ProductCard.tsx`

- Read `product.retailer_margin_target` (fallback to 70)
- Pass to `isRetailReady()`, `calculateRetailerShelfPrice()` calls
- Display actual margin target in labels

### 5. `src/lib/calculations.ts`

- No changes needed -- all functions already accept an optional `targetMargin` parameter with default 70

