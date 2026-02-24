

# Add "Retail-Ready" Auto-Suggest Button for Wholesale Price

## What This Does

Adds a button next to the Wholesale Markup input that automatically calculates and sets the wholesale markup percentage so that retailers get exactly a 70% margin. The user keeps full control over both markup inputs but gets a one-click shortcut to hit the retail-ready target.

## How It Works

Given:
- Retail Price = COGS x (1 + retail_markup / 100)
- Wholesale needs to be 30% of Retail for a 70% retailer margin

The auto-suggest calculates: **wholesale_markup = (retail_markup + 100) x 0.30 - 100**

For example, with a 300% retail markup (4x COGS), wholesale markup = 400 x 0.30 - 100 = **20%** (1.2x COGS), giving retailers exactly 70% margin.

## Changes

### 1. `src/components/ProductCalculator.tsx` -- Add auto-suggest button

- Next to the "Wholesale Markup (%)" label, add a small "Retail-Ready" button
- When clicked, it calculates the correct wholesale markup from the current retail markup and updates the form field
- The button will be styled subtly (outline/ghost style, small size) so it doesn't clutter the form
- A brief tooltip or description explains: "Sets wholesale to give retailers 70% margin"

### 2. `src/lib/calculations.ts` -- Add helper function

Add `calculateRetailReadyWholesaleMarkup(retailMarkup, targetMargin = 70)` that returns the wholesale markup percentage needed to achieve the target retailer margin.

## No Database Changes Required

This is purely a UI convenience feature -- no schema or backend changes needed.

