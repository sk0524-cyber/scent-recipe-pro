

# Add Weight-Based Input to Product Formulas

## What Changes

Currently, product formulas only accept **percentage** inputs (e.g., 75% base, 25% fragrance). This update adds an option to enter **actual weights** instead (e.g., 1.5 oz of DPB + 0.5 oz of fragrance), which is how many makers actually measure their recipes.

## How It Will Work

- A toggle switch at the top of the Formula section lets you choose between **"Percentage"** and **"Weight (oz)"** input modes
- In **Weight mode**, you enter the actual amount of each material per batch (e.g., 1.5 oz)
- The app automatically calculates the percentages from your weights (1.5 oz out of 2.0 oz total = 75%)
- All cost calculations continue to work the same way -- the weights are converted to percentages behind the scenes
- The percentage progress bar still shows whether your formula totals 100%
- Saved products still store percentages in the database, so nothing breaks for existing products

## Example: Your Incense Recipe

- Enter: 1.5 oz DPB + 0.5 oz Fragrance = 2.0 oz total per batch
- Auto-calculated: DPB = 75%, Fragrance = 25%
- Costs calculated from those percentages as before

## Technical Details

### Files Modified

**`src/components/ProductCalculator.tsx`**
- Add a `formulaInputMode` state: `"percentage"` or `"weight"`
- Add a toggle UI (segmented button or switch) in the Formula card header
- Add a `weight` field alongside percentage in the formula item schema (local only, not persisted)
- In weight mode: show weight input (oz) instead of percentage input
- Add a `useMemo` or `useEffect` that converts entered weights to percentages automatically:
  - `totalWeight = sum of all item weights`
  - `item.percentage = (item.weight / totalWeight) * 100`
- Show the auto-calculated percentage as a read-only badge next to each weight input
- The formula progress bar continues to work from the calculated percentages
- On submit, only percentages are saved (weights are a UI convenience)

**`src/components/ProductCalculator.tsx` -- Schema update**
- Extend `formulaItemSchema` to include an optional `weight` field: `weight: z.coerce.number().min(0).optional()`
- The weight field is only used in the UI and stripped before saving

### No Database Changes Required
Percentages remain the stored format. Weight input is a UI-only convenience that auto-converts to percentages.

### No Changes to `src/lib/calculations.ts`
All calculation functions continue to receive percentages as before.

