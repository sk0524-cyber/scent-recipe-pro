

# Separate Retailer Margin from Maker Margin

## What Changes

Right now, a single "Target Wholesale Margin" field controls both your maker margin goal AND the retailer shelf price calculation. This plan splits them into two independent settings:

1. **Target Wholesale Margin** (existing, default 70%) -- controls the "Target Margin" button and the "On Target / Below Target" indicator. This is YOUR profit goal.
2. **Retailer Margin** (new, default 50%) -- controls the "Retailer Shelf Price" calculation. This is the margin you expect the retailer to take.

## How It Works

A new "Retailer Margin (%)" input appears near the Retailer Shelf Price card. You set it to whatever margin you think the retailer will want (e.g., 50%). The shelf price updates accordingly:

- Wholesale Price = $10, Retailer Margin = 50% --> Shelf Price = $20
- Wholesale Price = $10, Retailer Margin = 40% --> Shelf Price = $16.50

The maker's wholesale margin target continues to work independently -- it only affects the "Target Margin" button and the "On Target" indicator.

## Technical Details

### 1. Database: Add `retailer_margin_percent` column

- New column on `products`: `retailer_margin_percent` (numeric, NOT NULL, DEFAULT 50)
- Existing `retailer_margin_target` stays as-is for the maker's wholesale margin

### 2. `src/hooks/useProducts.ts`

- Add `retailer_margin_percent` to `ProductFormData` and `ProductWithItems` types
- Include in create/update mutations

### 3. `src/components/ProductCalculator.tsx`

- Add a "Retailer Margin (%)" input field near the Retailer Shelf Price card (range 10-80)
- Use `retailer_margin_percent` (not `retailer_margin_target`) for `calculateRetailerShelfPrice()` and the "Based on X% retailer margin" label
- Keep `retailer_margin_target` only for the maker's "Target Margin" button and "On Target" indicator

### 4. `src/components/ProductCard.tsx`

- Read `product.retailer_margin_percent` (fallback 50) for shelf price calculation
- Keep `product.retailer_margin_target` (fallback 70) for the maker margin indicator

### 5. `src/lib/calculations.ts`

- No changes needed -- `calculateRetailerShelfPrice` already accepts a margin parameter
