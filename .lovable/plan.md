

# Fix Formula Cost Calculations to Use Actual Weights

## The Problem

Right now, when you enter weights like 1.5 oz DPB + 0.5 oz Fragrance, the app converts them to percentages (75% / 25%) and then recalculates the amounts using `totalBatchWeight = units_per_batch x fill_weight_per_unit`. For incense with 50 sticks, that gives a completely wrong batch weight -- the formula is 2 oz total regardless of how many sticks you make.

The correct calculation (as you showed) should multiply each weight directly by its cost per oz:
- DPG: 1.5 oz x $0.33/oz = $0.495
- Fragrance: 0.5 oz x $1.1062/oz = $0.5531
- Total formula cost: $1.0481

## The Fix

### 1. Update `calculateFormulaCosts` in `src/lib/calculations.ts`

Add an optional `weightPerBatch` field to the `FormulaItem` interface. When present, use it directly instead of deriving amounts from percentages:

```
// Current: amountPerBatch = (percentage / 100) * totalBatchWeight
// New: amountPerBatch = item.weightPerBatch ?? (percentage / 100) * totalBatchWeight
```

This keeps backward compatibility -- percentage-mode products still work exactly as before.

### 2. Update calculations in `src/components/ProductCalculator.tsx`

When in weight mode, pass the entered weights through to `calculateFormulaCosts`:

```
const formulaItems = watchAll.formula_items.map((item, index) => ({
  material_id: item.material_id,
  percentage: item.percentage,
  slot_type: item.slot_type,
  weightPerBatch: formulaInputMode === 'weight' ? (weights[index] || 0) : undefined,
}));
```

No other files need to change. The database still stores percentages. The only difference is that when you enter weights, costs are calculated from those actual weights instead of going through a percentage-to-weight round-trip that uses an unrelated batch weight.

## Summary of Changes

| File | Change |
|---|---|
| `src/lib/calculations.ts` | Add optional `weightPerBatch` to `FormulaItem`; use it directly when present |
| `src/components/ProductCalculator.tsx` | Pass `weights` into formula items when in weight mode |

