

# Add "Selling Pack Size" to Product Calculator

## What This Does

Right now, every cost and price is shown "per unit" (per single incense stick). This change adds an optional **"Units per Pack"** field so you can define how you actually sell the product (e.g., 10 sticks per pack). The calculator will then show costs and suggested prices both per single unit AND per pack.

## How It Works

Your incense example:
- Batch: 50 sticks
- Pack size: 10 sticks
- Packs per batch: 5
- COGS per stick: $X --> COGS per pack: $X times 10
- Wholesale/Retail prices calculated and rounded at the pack level

## Changes

### 1. Database: Add `selling_pack_size` column to `products` table

A new optional integer column defaulting to 1 (meaning "sold individually" -- no change for existing products).

### 2. `src/hooks/useProducts.ts` -- Add the field to types and queries

- Add `selling_pack_size: number` to `Product`, `ProductFormData`
- Pass it through create/update/duplicate mutations

### 3. `src/components/ProductCalculator.tsx` -- Add input and pack-level display

- Add a **"Units per Selling Pack"** number input in the Product Details section (below Units per Batch)
  - Helper text: "How many individual units in one sellable pack (e.g., 10 sticks per pack)"
  - Default: 1
- In the COGS and Pricing Summary section, when pack size > 1:
  - Show both "per unit" and "per pack" costs
  - Calculate wholesale/retail prices at the **pack level** (COGS per unit x pack size, then apply markup and round)
  - Show "Packs per batch: X" info

### 4. `src/lib/calculations.ts` -- Add pack-level price helpers

- Add `calculatePackCOGS(cogsPerUnit, packSize)` 
- Update wholesale/retail calculation to accept pack-level COGS

### 5. `src/components/ProductCard.tsx` -- Show pack pricing on cards

- When `selling_pack_size > 1`, display prices as "per pack of X" instead of just the raw number
- Show both per-unit COGS and per-pack selling prices

## What Stays the Same

- All internal calculations remain per-unit (materials, labor, shipping, etc.)
- Existing products default to pack size 1 -- no change in behavior
- Database stores per-unit costs as before
- Pack pricing is derived at display time from per-unit COGS times pack size

## Technical Details

| File | Change |
|---|---|
| Database migration | Add `selling_pack_size INTEGER NOT NULL DEFAULT 1` to products |
| `src/hooks/useProducts.ts` | Add field to interfaces, pass through CRUD |
| `src/components/ProductCalculator.tsx` | Add pack size input, show pack-level summary |
| `src/lib/calculations.ts` | Add `calculatePackCOGS` helper |
| `src/components/ProductCard.tsx` | Show "per pack of X" when applicable |
| `src/lib/export.ts` | Include pack size and pack prices in CSV export |

