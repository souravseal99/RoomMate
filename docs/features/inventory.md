# Inventory System

## Overview
The Inventory module provides real-time tracking of shared household supplies (e.g., dish soap, paper towels, milk) to prevent unexpected shortages.

## Key Features
- **Stock Levels**: Tracks current quantities of items.
- **Low Stock Threshold**: Users set a `lowThreshold` for each item. When `quantity <= lowThreshold`, the item is flagged.
- **Automated Shopping List**: Any item below its threshold is automatically added to the "Needed" section or a generated shopping list.

## Workflow
1. **Add Item**: Define a new item name, initial quantity, and alert threshold.
2. **Update Stock**: Quickly increment or decrement quantities as items are used or purchased.
3. **Shopping Mode**: View a filtered list of all items marked as "Low Stock" for easy reference during grocery runs.

## Technical Details
- **API**: Uses `PUT /api/inventory/:id` for rapid quantity adjustments.
- **Frontend State**: Inventory levels are managed via a dedicated hook to allow fast UI updates across the application.
