

## Sales Tracking for Retail Stores

### Overview
Create a sales tracking system so you can log actual units sold per product per store, then see which stores sell the most and which are the most profitable -- all from the Retail Stores page.

### What you'll get
- A new **"store_sales_records"** database table to log actual units sold per product per store per month
- On the **Retail Stores page**, each store card becomes clickable and expands into a detail view showing:
  - A table of all products assigned to that store with actual units sold (editable inline)
  - Avg Retail Price, Wholesale Margin, Units/Month, and Units/Year computed from real sales data
- An **inline editable units field** so you can quickly update units sold whenever you get info from a store or place an order
- **Store-level summary cards** on the main Retail Stores page ranked by profitability so you can instantly see your best-performing stores

### Database

**New table: `store_sales_records`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | auto-generated |
| assignment_id | uuid, FK to product_store_assignments | links to a specific product-store pair |
| period_month | date | first day of the month (e.g. 2026-03-01) |
| units_sold | numeric, default 0 | actual units sold that month |
| notes | text, nullable | optional notes (e.g. "restock order") |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

- Unique constraint on (assignment_id, period_month) so there's one record per product-store per month
- RLS policies scoped through product_store_assignments -> products -> user_id (same pattern as existing assignment policies)

### UI Changes

**1. Retail Stores page (`RetailStoreAnalytics.tsx`) -- enhanced store cards**
- Each store card shows summary metrics computed from **actual sales data** (falling back to estimated_monthly_units when no sales records exist)
- Cards are sorted by wholesale margin (most profitable first)
- Clicking a card expands it to show a per-product breakdown table

**2. Store detail view (expandable section or dialog per store card)**
- Table columns: Product Name | Retail Price | Wholesale Price | Units Sold (this month) | Units/Year (sum of last 12 months) | Margin %
- The "Units Sold" column has an inline editable input -- tap the number, type the new value, it saves automatically
- A month picker at the top lets you select which month you're entering/viewing data for (defaults to current month)
- "Add Sales Record" button for quick entry

**3. New hook: `useStoreSalesRecords.ts`**
- Fetches sales records for a given store (or all stores)
- Upsert mutation: insert or update units_sold for a given assignment + month
- Uses the same auth pattern as existing hooks

### How metrics are calculated

- **Units / Month**: Sum of actual `units_sold` from sales records for the current month (falls back to `estimated_monthly_units` if no records)
- **Units / Year**: Sum of `units_sold` across the last 12 months of sales records
- **Avg Retail Price**: Average `retail_price` across all products assigned to the store (unchanged)
- **Wholesale Margin**: Average `((wholesale_price - packCOGS) / wholesale_price * 100)` across assigned products (unchanged)

### Files to create
- `src/hooks/useStoreSalesRecords.ts` -- CRUD hook for sales records
- Database migration for `store_sales_records` table

### Files to edit
- `src/pages/RetailStoreAnalytics.tsx` -- add expandable detail view, inline unit editing, month picker, sort by profitability
- `src/hooks/useAllAssignments.ts` -- may need to fetch sales records alongside assignments

