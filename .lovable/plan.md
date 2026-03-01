

## Add Summary Row to Wholesale Channels Table

### What changes
A summary row will be added at the bottom of the Wholesale Channels table showing aggregated metrics across all assigned stores.

### Summary row content
- **Store column**: "Average" (bold, italicized)
- **Commission %**: Average commission across all assignments
- **Fee/Unit**: Average fee per unit
- **Your Net**: Average net price
- **Margin %**: Average margin percentage, color-coded using the same thresholds (green >= 50%, amber >= 30%, red below)

### Technical details

**File: `src/components/WholesaleChannels.tsx`**

After the `TableBody` rows loop, add a `TableFooter` with a single summary row. The values will be computed by iterating over all assignments, calling `computeRow()` for each, collecting the numeric results, and averaging them. The summary row only renders when there are 2 or more assignments (no point showing an average of one row). The row will use a subtle `bg-muted/50` background and bold text to visually distinguish it from data rows.

