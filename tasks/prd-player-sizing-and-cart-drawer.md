# PRD: Player Sizing System & Cart Drawer

## Introduction

This feature adds a comprehensive sizing system for players (particularly children) and modernizes the cart experience. Players can have saved size preferences across product types (jersey, t-shirt, socks, hat), and when ordering for a child, selecting a size for one product type automatically syncs sizes across all product types. The cart is converted from a dedicated page to a responsive drawer/dialog accessible from anywhere in the app.

## Goals

- Store player size preferences by product type (jerseySize, tshirtSize, sockSize, hatSize)
- Categorize items by type (jersey, t-shirt, socks, hat) and audience (adult vs child)
- Automatically sync sizes across product types when ordering for children
- Replace the cart page with a responsive drawer/dialog for a smoother shopping experience
- Reuse the existing product grid component in the cart for consistency

## User Stories

### US-001: Add size columns to Player table
**Description:** As a developer, I need to store player size preferences by product type so sizes persist and can be pre-filled.

**Acceptance Criteria:**
- [ ] Add migration with columns: `jerseySize`, `tshirtSize`, `sockSize`, `hatSize` (all TEXT, nullable)
- [ ] Update TypeScript types in `lib/types/database.ts` to include new columns
- [ ] Migration runs successfully without data loss
- [ ] Typecheck passes

---

### US-002: Add type and adult columns to Item table
**Description:** As a developer, I need to categorize items by type and audience so the system knows which size fields to use.

**Acceptance Criteria:**
- [ ] Add migration with `type` column: enum or TEXT with values 'jersey' | 't-shirt' | 'socks' | 'hat'
- [ ] Add migration with `adult` column: BOOLEAN NOT NULL (no default - must be explicitly set)
- [ ] Update existing items with appropriate type and adult values based on item names
- [ ] Update TypeScript types in `lib/types/database.ts`
- [ ] Migration runs successfully
- [ ] Typecheck passes

---

### US-003: Create player size management UI
**Description:** As a parent, I want to set my child's sizes in their player profile so I don't have to remember them when ordering.

**Acceptance Criteria:**
- [ ] **Use `vercel-react-best-practices` skill before implementation**
- [ ] Add size fields to player edit form/modal (jerseySize, tshirtSize, sockSize, hatSize)
- [ ] Size dropdowns show appropriate options based on typical child/youth sizes
- [ ] Saving updates the Player record in database
- [ ] Sizes persist and show correctly when re-opening player profile
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-004: Pre-fill sizes when adding items for a player
**Description:** As a parent, I want sizes pre-filled from my child's profile when adding items to cart so ordering is faster.

**Acceptance Criteria:**
- [ ] **Use `vercel-react-best-practices` skill before implementation**
- [ ] When selecting a player for an item, size dropdown pre-fills based on item type and player's saved size
- [ ] Jersey items use player's `jerseySize`
- [ ] T-shirt items use player's `tshirtSize`
- [ ] Sock items use player's `sockSize`
- [ ] Hat items use player's `hatSize`
- [ ] User can still override the pre-filled size
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-005: Sync child sizes across product types
**Description:** As a parent, when I select a size for one product type for my child, I want all other product types to update to matching sizes so I don't have to set each one individually.

**Acceptance Criteria:**
- [ ] **Use `vercel-react-best-practices` skill before implementation**
- [ ] When size is selected for a child item (adult=false), sync size to all other product types
- [ ] Update the Player record with new sizes for all four product types
- [ ] Update any existing cart items for that player with the new sizes (matching by type)
- [ ] Sync only triggers for child items (adult=false), not adult items
- [ ] Show visual feedback that sizes were synced (toast notification or similar)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-006: Create server action for size sync
**Description:** As a developer, I need a server action that handles the size synchronization logic atomically.

**Acceptance Criteria:**
- [ ] Create `syncPlayerSizes` action in `app/actions/player.ts` or similar
- [ ] Action accepts: playerId, selectedSize, productType
- [ ] Action updates Player record with size for all four product type columns
- [ ] Action updates all OrderItems in DRAFT orders for that player, matching by item type
- [ ] Action runs in a transaction to ensure atomicity
- [ ] Action returns updated player and affected cart item count
- [ ] Typecheck passes

---

### US-007: Convert cart page to responsive drawer
**Description:** As a user, I want to access my cart via a drawer/dialog instead of navigating to a separate page so I can quickly review my order without losing context.

**Acceptance Criteria:**
- [ ] **Use `vercel-react-best-practices` skill before implementation**
- [ ] Remove or redirect `/cart` page route
- [ ] Implement responsive drawer using shadcn pattern (Dialog on desktop, Drawer on mobile)
- [ ] Drawer opens from cart icon in header
- [ ] Drawer title is "My Order"
- [ ] Drawer can be closed by clicking outside, pressing escape, or close button
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-008: Display cart items in drawer using product grid
**Description:** As a user, I want my cart items displayed consistently with the homepage product grid so the experience feels cohesive.

**Acceptance Criteria:**
- [ ] **Use `vercel-react-best-practices` skill before implementation**
- [ ] Refactor ProductGrid/ProductCard components to be reusable for cart context
- [ ] Cart drawer displays items using the same visual style as homepage
- [ ] Cart items show: product image, name, price, quantity, size (if applicable), player name
- [ ] Each cart item has quantity controls (increase/decrease/remove)
- [ ] Cart shows order total at bottom
- [ ] Empty cart shows appropriate empty state message
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-009: Add cart actions to drawer
**Description:** As a user, I want to manage my cart and submit my order from the drawer.

**Acceptance Criteria:**
- [ ] **Use `vercel-react-best-practices` skill before implementation**
- [ ] "Continue Shopping" button closes drawer
- [ ] "Submit Order" button submits the order (changes status from DRAFT to OPEN)
- [ ] Submit button disabled when cart is empty
- [ ] Show confirmation after successful order submission
- [ ] Close drawer and show success message after order submitted
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-010: Update header cart icon with item count
**Description:** As a user, I want to see how many items are in my cart without opening it.

**Acceptance Criteria:**
- [ ] **Use `vercel-react-best-practices` skill before implementation**
- [ ] Cart icon in header shows badge with item count
- [ ] Badge updates reactively when items are added/removed
- [ ] Badge hidden when cart is empty (no "0" badge)
- [ ] Clicking cart icon opens the cart drawer
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Player table must have nullable TEXT columns: `jerseySize`, `tshirtSize`, `sockSize`, `hatSize`
- FR-2: Item table must have `type` column with values: 'jersey' | 't-shirt' | 'socks' | 'hat'
- FR-3: Item table must have `adult` BOOLEAN column (true = adult sizes, false = child/youth sizes)
- FR-4: When a size is selected for an item where adult=false, the system must update the corresponding Player's size columns for ALL product types
- FR-5: When syncing sizes, the system must also update any existing DRAFT OrderItems for that player
- FR-6: Cart must be accessible via a responsive drawer/dialog (Dialog on desktop ≥768px, Drawer on mobile)
- FR-7: Cart drawer must use the same ProductCard component style as the homepage
- FR-8: Cart drawer title must be "My Order"
- FR-9: Size pre-fill must map item.type to the corresponding player size column
- FR-10: Size sync must only trigger for child items (adult=false), never for adult items
- FR-11: Adding an item to cart must NOT automatically open the cart drawer - user must explicitly click cart icon
- FR-12: Size sync is mandatory for child items - no user option to disable it

## Non-Goals

- No automatic size recommendations based on age/measurements
- No size conversion charts or guides
- No inventory/stock tracking for sizes
- No size-based pricing differences
- No multi-player cart (each cart item is for one player)
- No order history in the drawer (only current DRAFT order)

## Design Considerations

- Use shadcn's responsive Dialog/Drawer pattern: https://ui.shadcn.com/docs/components/drawer#responsive-dialog
- Cart drawer should have max-width on desktop to not feel overwhelming
- Product cards in cart need slight modifications (show player name, quantity controls instead of add button)
- Consider using Vaul drawer library (already used by shadcn) for mobile swipe gestures
- Toast notifications for size sync feedback should be subtle but informative

## Technical Considerations

### Required Skills
**IMPORTANT:** All React/Next.js implementation work MUST use the `vercel-react-best-practices` skill. This ensures:
- Proper Server Component vs Client Component boundaries
- Optimal data fetching patterns (Server Components for data, minimal client-side fetching)
- Correct use of React hooks and state management
- Performance-optimized rendering and bundle size
- Proper use of Next.js App Router patterns

Before implementing any UI story (US-003 through US-010), run the `vercel-react-best-practices` skill to review the guidelines.

### Architecture
- Size sync must be atomic (transaction) to prevent partial updates
- Cart state should use React context or similar for reactive updates across components
- Consider optimistic updates for cart operations for snappy UX
- ProductCard component needs props to switch between "add mode" and "cart mode"
- Header cart count may need real-time updates (consider server actions with revalidation)

### Performance Patterns (per Vercel best practices)
- Use Server Components by default; only add 'use client' when needed for interactivity
- Fetch data in Server Components, pass to Client Components as props
- Use `useTransition` for non-blocking UI updates during cart operations
- Avoid client-side data fetching for initial cart state - fetch on server
- Colocate data fetching with components that need it
- Use streaming/Suspense for the cart drawer content

## Success Metrics

- Parents can set up player sizes once and have them pre-fill on all future orders
- Child size selection updates all product types in under 500ms
- Cart drawer opens in under 200ms
- Zero navigations required to add items and submit order (all via drawer)

## Resolved Questions

1. ~~What size options should be available for each product type?~~ **Resolved:** Use existing sizes from the Item table's `sizes` array - no new size definitions needed.
2. ~~Should there be a way to disable size sync?~~ **Resolved:** No - size sync is always enabled for child items.
3. ~~Should the cart drawer remain open after adding an item?~~ **Resolved:** No - drawer does NOT open when adding items. User must explicitly click cart icon to open drawer.
