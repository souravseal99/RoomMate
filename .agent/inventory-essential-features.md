# Inventory & Shopping Cart Module — Essential Features & User Flows

This document details all essential features, user flows, business logic, auto-replenishment automation, and API interactions for the **Inventory & Shared Shopping Cart** module in the **RoomMate** application.

It is structured in accordance with [household-design-philosophy.md](file:///Users/souravseal/RoomMate/.agent/household-design-philosophy.md), focusing on the Gen-Z/Millennial target demographic (18–35), frictionless 1-tap quantity adjustments, and automated grocery list generation.

---

## 1. Feature Matrix & Capabilities

### 1.1 Tactile Whiteboard Pantry & Consumables Tracker
- **Smart Stock Status Indicators**:
  - **In Stock 🟢**: Healthy quantity above threshold (`quantity > lowThreshold`).
  - **Running Low 🟡**: Quantity has dropped to or below minimum (`quantity <= lowThreshold`).
  - **Out of Stock 🔴**: Empty supply (`quantity === 0`).
- **1-Tap Direct Steppers (+ / -)**: Increment or decrement quantity directly on the card with instant optimistic UI update (zero typing needed).
- **Preset Quick-Item Chips**: 1-click pantry staples (*"Milk 🥛"*, *"Eggs 🥚"*, *"Paper Towels 🧻"*, *"Dish Soap 🧼"*, *"Coffee ☕"*, *"Trash Bags 🗑️"*, *"Olive Oil 🫒"*).
- **Custom Low Stock Thresholds**: Set per-item warning trigger (e.g. alert when eggs drop to `<= 2`).

### 1.2 Automated Shared Shopping Cart
- **1-Tap Auto-Import Low Stock**: Automatically scans pantry items below threshold and transfers missing items into the shopping cart with a single click.
- **Manual Quick-Add**: Add one-off items directly to the shopping cart (e.g. party snacks, weekend drinks).
- **In-Store Shopping Checklist Mode**: Clean tap-to-cross-off list for flatmates while walking grocery aisles.
- **Item Removal & Restock**: 1-tap removal of purchased items.

---

## 2. End-to-End User Flows

### Flow 1: 1-Tap Quantity Stepper Update (Lazy Restock / Use)
1. **Trigger**: Roommate uses the last carton of milk and wants to update the status in 2 seconds.
2. **Interaction**: Roommate opens `/inventory` and taps the **minus (`-`)** stepper button on the *Milk* card.
3. **Client Action**: Decrements quantity from `1` to `0` optimistically.
4. **API Request**: `PATCH /inventory/:itemId` with `{ quantity: 0 }`.
5. **Instant Feedback**: Status chip immediately shifts from green to an alert badge *"Out of Stock 🔴"*, and a prompt appears: *"Add to Shopping Cart?"*.

---

### Flow 2: 1-Tap Auto-Import Low Stock Items to Shopping Cart
1. **Trigger**: Roommate is heading to the grocery store and clicks **"Auto-Add Low Stock to Cart"**.
2. **API Request**: `POST /shopping-cart/add-low-stock/:householdId`.
3. **Server Logic**:
   - Queries all `InventoryItem` records where `quantity <= lowThreshold` for the active household.
   - Creates corresponding `ShoppingCart` items for any missing products.
4. **Resolution**: Shopping cart updates instantly with notification: *"3 low stock items (Milk, Dish Soap, Trash Bags) added to your shared cart 🛒"*.

---

### Flow 3: Rapid Inventory Item Creation (Preset Chips)
1. **Trigger**: User wants to track a new household consumable.
2. **Form Interaction**:
   - User clicks "+ Add Item".
   - Taps preset chip *"Paper Towels"*.
   - Quantity defaults to `4`, threshold defaults to `1`.
   - Clicks **"Track Item"**.
3. **API Request**: `POST /inventory/add` with `{ name: "Paper Towels", quantity: 4, lowThreshold: 1, householdId }`.
4. **Resolution**: Item card appears on the board instantly with healthy stock badge.

---

### Flow 4: In-Store Shopping Checklist Flow
1. **Trigger**: Roommate arrives at the store and opens the **Shopping Cart** tab.
2. **API Request**: `GET /shopping-cart/:householdId`.
3. **Interaction**: As items are placed in the physical shopping basket, roommate taps the item checkbox.
4. **API Request**: `DELETE /shopping-cart/:cartItemId` (or mark completed).
5. **Resolution**: Item is checked off with strike-through animation, leaving a clean list of remaining items.

---

### Flow 5: Deleting an Inventory Item
1. **Trigger**: Flat no longer uses or stocks a specific item.
2. **Interaction**: Clicks card menu -> "Delete Item".
3. **API Request**: `DELETE /inventory/:itemId`.
4. **Resolution**: Item removed from tracker with confirmation toast.

---

## 3. Backend API Endpoints & Data Contracts

| Operation | HTTP Method & Route | Request Data | Response Data |
| :--- | :--- | :--- | :--- |
| **Fetch Inventory Items** | `GET /inventory/:householdId` | URL param: `householdId` | `{ data: InventoryItem[] }` |
| **Add Inventory Item** | `POST /inventory/add` | `{ name: string, quantity: number, lowThreshold: number, householdId: string }` | `{ data: InventoryItemResponse }` |
| **Update Item Quantity/Threshold** | `PATCH /inventory/:itemId` | `{ quantity?: number, lowThreshold?: number, name?: string }` | `{ data: UpdatedInventoryItem }` |
| **Delete Inventory Item** | `DELETE /inventory/:itemId` | URL param: `itemId` | `{ data: null, message: "Item deleted" }` |
| **Fetch Shopping Cart** | `GET /shopping-cart/:householdId` | URL param: `householdId` | `{ data: CartItem[] }` |
| **Add Item to Cart** | `POST /shopping-cart/add` | `{ itemName: string, quantity: number, householdId: string }` | `{ data: CartItem }` |
| **Auto-Import Low Stock to Cart** | `POST /shopping-cart/add-low-stock/:householdId` | URL param: `householdId` | `{ data: { count: number, items: CartItem[] } }` |
| **Update Cart Item** | `PATCH /shopping-cart/:cartItemId` | `{ itemName?: string, quantity?: number }` | `{ data: CartItem }` |
| **Remove Cart Item** | `DELETE /shopping-cart/:cartItemId` | URL param: `cartItemId` | `{ data: null, message: "Item removed from cart" }` |
