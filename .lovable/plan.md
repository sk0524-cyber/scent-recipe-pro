

## Retail Stores Analytics Page + Wholesale Channels Cleanup

### Overview
Add a new "Retail Stores" navigation tab that shows a per-store performance dashboard, and clean up the "Average" label from the Wholesale Channels table footer.

### 1. New page: `src/pages/RetailStoreAnalytics.tsx`

A new page accessible from the header nav that displays a card/table for each retail store with aggregated metrics across all products assigned to that store:

**Per-store metrics:**
- **Avg Retail Price** -- average `retail_price` (or wholesale price, depending on pack size) across all products assigned to the store
- **Wholesale Margin** -- average wholesale margin `((wholesale_price - packCOGS) / wholesale_price * 100)` across assigned products
- **Units/Month** -- sum of `estimated_monthly_units` from all product_store_assignments for that store
- **Units/Year** -- Units/Month x 12

**Data fetching approach:**
- Fetch all `product_store_assignments` for the user (via a new query or hook)
- Join with products data (fetched via `useProducts`) and stores data (via `useRetailStores`)
- Compute metrics client-side by grouping assignments by `store_id`

**UI layout:**
- One card per store showing the store name and a grid of the four metrics
- Empty state if no stores exist or no assignments exist
- Uses existing `Layout`, `Card`, and formatting utilities

### 2. Navigation update: `src/components/Layout.tsx`

Add a "Retail Stores" nav item (using the `Store` icon from lucide) pointing to `/retail-stores`.

### 3. Route: `src/App.tsx`

Add a new route `/retail-stores` wrapped in `AuthGuard`.

### 4. Remove "Average" from Wholesale Channels: `src/components/WholesaleChannels.tsx`

Change the summary row label from "Average" to just show the aggregated values without the "Average" text label in the first cell (or remove the entire footer row -- clarifying: the user said "remove Average", so the footer row label cell will be left blank or show a dash).

### Technical details

**New file: `src/pages/RetailStoreAnalytics.tsx`**
- Import `useRetailStores`, `useProducts`, and a new query for all user's product_store_assignments
- Group assignments by `store_id`, compute per-store: avg wholesale margin, avg retail price, total monthly units, total yearly units
- Render in a responsive card grid

**New hook or inline query:**
- Fetch all `product_store_assignments` for products owned by the user (RLS handles this automatically)
- No new database changes needed -- existing tables and RLS policies cover this

**Files to create:**
- `src/pages/RetailStoreAnalytics.tsx`

**Files to edit:**
- `src/components/Layout.tsx` -- add nav item
- `src/App.tsx` -- add route
- `src/components/WholesaleChannels.tsx` -- remove "Average" label from footer row

