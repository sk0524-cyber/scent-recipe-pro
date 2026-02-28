

## Plan: Add `cost_basis` Column and Fix Build Error

### 1. Run Database Migration

Add the `cost_basis` column to `product_component_items`:

```sql
ALTER TABLE public.product_component_items 
ADD COLUMN IF NOT EXISTS cost_basis TEXT NOT NULL DEFAULT 'unit' 
CHECK (cost_basis IN ('unit', 'pack'));
```

### 2. Fix TypeScript Build Error

The build error is a type mismatch between two `Material` interfaces:
- `src/lib/calculations.ts` defines a lightweight `Material` (missing `created_at`, `updated_at`, `user_id`)
- `src/hooks/useMaterials.ts` defines the full `Material` (with those fields)
- The `Calculations` type in `src/components/calculator/types.ts` references the full `Material` from `useMaterials`

The `calculateFormulaCosts` and `calculateComponentCosts` functions in `calculations.ts` return objects typed with the lightweight `Material`, causing incompatibility when assigned to the `Calculations` type.

**Fix:** Update the `Material` interface in `src/lib/calculations.ts` to include the three missing optional fields (`created_at`, `updated_at`, `user_id`) so it's compatible with the full `Material` type from `useMaterials.ts`. This is the minimal change that resolves the type error without restructuring imports.

### Technical Details

**File: `src/lib/calculations.ts`** (lines 3-15)
- Add `created_at?: string`, `updated_at?: string`, `user_id?: string | null` to the `Material` interface

This makes the lightweight `Material` a structural supertype-compatible shape with the full `Material`, so objects of the full type can be assigned where the lightweight type is expected.

