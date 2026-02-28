

# Add In-App Help & Instructions

Add contextual help sections to the Dashboard, Materials, and Calculator pages using collapsible accordion panels so instructions are available but don't clutter the interface.

## What will be added

### 1. Dashboard -- "Understanding Your Overview" help section
A collapsible help panel below the hero section explaining:
- What "Avg Wholesale Margin" means (profit you keep on wholesale sales)
- What "Avg DTC Margin" means (profit you keep on direct-to-consumer sales)
- What "Avg Combined Margin" means (average of both)
- What the color codes mean (green = healthy 60%+, amber = moderate 40-59%, red = low under 40%)
- What "Avg Cost per Unit" and "Avg Retail Price" represent

### 2. Materials page -- "How to Add Materials" help section
A collapsible help panel below the page header explaining:
- What materials are (raw ingredients and packaging components)
- Step-by-step: click "Add Material", choose a category, enter name, cost, and pack size
- Tip: materials are reusable across all products

### 3. Calculator page -- "How to Use the Calculator" help section
A collapsible help panel below the page header explaining:
- Step-by-step workflow: name your product, set batch size, add formula ingredients with percentages, add packaging components, set labor and overhead, then review COGS and pricing
- How markup and target margin work
- How to duplicate or export products

## Technical approach

- Create a new reusable `HelpSection` component using the existing `Collapsible` + `Accordion` UI primitives
- Each page gets a `HelpSection` with relevant accordion items
- Uses a `HelpCircle` icon button to toggle open/closed, keeping the UI clean
- Styled consistently with the existing card/muted design language

### Files to create
- `src/components/HelpSection.tsx` -- reusable collapsible help wrapper with accordion items

### Files to modify
- `src/pages/Index.tsx` -- add help section after the hero
- `src/pages/Materials.tsx` -- add help section after the page header
- `src/pages/Calculator.tsx` -- add help section after the page header (in both list and form views)
