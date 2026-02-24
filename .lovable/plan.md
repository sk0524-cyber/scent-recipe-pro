

# Move Retailer Shelf Price Below Retail-Ready Indicator

## What Changes

Remove the "Retailer Shelf" column from the 4-column pricing grid and instead display it as part of the Retail-Ready indicator banner at the bottom of the card.

## Details

### `src/components/ProductCard.tsx`

1. **Pricing grid**: Revert from 4 columns back to 3 columns (COGS, Wholesale, DTC Retail) by removing the "Retailer Shelf" column (lines 133-141).

2. **Retail-Ready indicator section**: Expand the existing banner (lines 144-158) to include the Retailer Shelf price. Below the "Retail-Ready" or "Low Retail Margin" line, add the retailer shelf price and its label so it reads something like:

   ```
   ⚠ Low Retail Margin          62.5%
   Retailer Shelf Price         $48.50
   ```

   This keeps the shelf price contextually paired with the margin status it relates to.

No other files need to change.

