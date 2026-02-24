

# Add Suggested Retail Price for Wholesale Channel

## What This Does

Adds a new price display showing what a retailer would likely charge customers when they buy your product at your wholesale price. This helps you see both your DTC (direct-to-consumer) retail price and the retailer's expected shelf price side by side.

## How It Works

If your wholesale price is $14.50 and retailers need a 70% margin, the suggested retail price is:

**Suggested Retail = Wholesale Price / 0.30 = $48.33** (rounded to nearest $0.50 = $48.50)

This is the price a retailer would put on their shelf to achieve the standard 70% margin.

## Changes

### 1. Calculator pricing display (`src/components/ProductCalculator.tsx`)

- Expand the final prices section from a 2-column grid to a 3-column grid
- Rename "Wholesale Price" to "Wholesale Price" (unchanged)
- Rename "Retail Price" to "DTC Retail Price" to clarify it's your direct-to-consumer price
- Add a third card: "Retailer Shelf Price" showing the suggested retail price a store would charge (wholesale / 0.30, rounded to nearest $0.50)
- Include a small note: "Based on 70% retailer margin"

### 2. Product card pricing display (`src/components/ProductCard.tsx`)

- Expand the pricing grid from 3 columns to 4 columns
- Add "Retailer Shelf" price alongside COGS, Wholesale, and DTC Retail
- Show the retailer margin beneath it, matching the existing margin display style

### 3. Calculation helper (`src/lib/calculations.ts`)

- Add a `calculateRetailerShelfPrice(wholesalePrice, targetMargin = 70)` function
- Formula: `wholesalePrice / (1 - targetMargin / 100)`, rounded to nearest $0.50

### No database changes required

This is a display-only feature calculated from existing data.

