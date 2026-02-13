
# Simplify Product Details Wording for Incense

## Problem
The current labels -- "Units per Batch," "Units per Selling Pack," and "Units per Bundle" (fill weight) -- are confusing. You want clear, intuitive language that maps to how you actually think about your incense production:

- I make **50 sticks** per batch
- I sell them **10 sticks per pack**
- That gives me **5 packs per batch**

## Changes

### 1. Update field labels and helper text in `src/components/ProductCalculator.tsx`

For **Incense** product type specifically, change the wording:

| Current Label | New Label (Incense) | Helper Text |
|---|---|---|
| Units per Batch | **Sticks per Batch** | How many individual sticks you make in one batch |
| Units per Selling Pack | **Sticks per Pack** | How many sticks go into one sellable pack |
| Fill Weight (Units per Bundle) | Remove / hide for Incense | Not needed -- the "bundle" concept is replaced by the pack size |

For **non-Incense** types, the labels stay the same as they are now.

### 2. Update the batch info summary

Currently shows: "Total batch size: 2500.00 bundle"

Change to show (for Incense):
- **Sticks per batch:** 50
- **Sticks per pack:** 10
- **Packs per batch:** 5

### 3. Simplify Incense-specific behavior

For Incense, the `fill_weight_per_unit` field is currently labeled "Units per Bundle" and set to 50 -- this is being confused with the batch size. For Incense, we should:
- Auto-set `fill_weight_per_unit` to `1` (each stick is one unit for formula cost purposes)
- Hide the fill weight field since it is not meaningful for incense
- Hide the Fill Unit dropdown for incense (it will stay as "bundle" internally)

### 4. Update COGS summary labels

When pack size > 1, show:
- **COGS per stick:** $X.XX
- **COGS per pack (10 sticks):** $X.XX

Instead of generic "COGS per unit" and "COGS per pack of 10."

## Technical Details

All changes are in `src/components/ProductCalculator.tsx`:

- Update `getProductGuidance()` for Incense to return clearer labels
- Add conditional label logic: when `productType === 'Incense'`, use "Sticks per Batch" / "Sticks per Pack"
- Hide `fill_weight_per_unit` and `fill_unit` fields when Incense is selected; auto-set fill weight to 1
- Update the batch info summary block to use product-type-aware unit names (e.g., "sticks" for incense)
- Update COGS summary to use "per stick" / "per pack (X sticks)" wording for Incense
