# PRD: Muldoon E-commerce Features

## Introduction

Implement a complete e-commerce experience for the Muldoon Raptors team merchandise store. This includes magic link authentication via Supabase, a product catalog with shopping cart functionality, checkout with email notifications, and an admin dashboard for managing items and orders.

The system solves:
- **For customers**: Easy browsing and ordering of team merchandise with size selection and player customization (for jerseys/hoodies)
- **For admins**: Centralized order management with bulk status updates and item catalog maintenance

## Goals

- Enable user authentication via magic link (passwordless login)
- Display product catalog with 19 seeded team items
- Allow authenticated users to add items to cart with size and player info (where required)
- Persist cart in database across sessions
- Send email notification to admin on order submission
- Provide admin dashboard for CRUD operations on items
- Enable admin to view, filter, and bulk-update order statuses
- Protect admin routes from non-admin users

---

## User Stories

### US-001: Install dependencies and create Supabase clients
**Description:** As a developer, I need the required packages and Supabase client utilities so the app can communicate with Supabase for auth and data.

**Acceptance Criteria:**
- [ ] `@supabase/supabase-js`, `@supabase/ssr`, `resend`, `zod`, `@tanstack/react-table` installed
- [ ] `lib/supabase/server.ts` created with server-side client using cookies
- [ ] `lib/supabase/client.ts` created with browser-side client
- [ ] `lib/supabase/middleware.ts` created for middleware auth handling
- [ ] `lib/supabase/admin.ts` created with `isAdminEmail()` function checking `ADMIN_EMAIL` env var
- [ ] Typecheck passes (`bun x ultracite check`)

### US-002: Create TypeScript types and utilities
**Description:** As a developer, I need type definitions and utility functions so the codebase is type-safe and consistent.

**Acceptance Criteria:**
- [ ] `lib/types/database.ts` defines: `OrderStatus`, `User`, `Item`, `Order`, `OrderItem`, `CartItem`, `CartWithItems`
- [ ] `lib/types/database.ts` exports `PLAYER_INFO_REQUIRED_ITEMS = [1, 2, 10, 19]` and `requiresPlayerInfo()` function
- [ ] `lib/utils/currency.ts` exports `formatCents(cents: number): string` returning formatted USD
- [ ] Typecheck passes

### US-003: Create login page with magic link form
**Description:** As a user, I want to enter my email and receive a magic link so I can log in without a password.

**Acceptance Criteria:**
- [ ] `/app/login/page.tsx` renders login card with email input
- [ ] `/components/auth/login-form.tsx` is a client component with email input and submit button
- [ ] Submitting calls `supabase.auth.signInWithOtp()` with redirect to `/auth/callback`
- [ ] Success shows message "Check your email for the magic link!"
- [ ] Error displays error message from Supabase
- [ ] Loading state shows spinner on button
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

### US-004: Create auth callback handler
**Description:** As a user, I want clicking the magic link to complete my login and create my account if it's my first time.

**Acceptance Criteria:**
- [ ] `/app/auth/callback/route.ts` exchanges code for session via `exchangeCodeForSession()`
- [ ] If user doesn't exist in `User` table, creates record with `supabaseId`, `email`, and `isAdmin` based on `ADMIN_EMAIL`
- [ ] If user exists, updates `isAdmin` if admin status changed
- [ ] Redirects to `/` on success or `/login?error=...` on failure
- [ ] Typecheck passes

### US-005: Create route protection middleware
**Description:** As an admin, I want protected routes so only authorized users can access admin features.

**Acceptance Criteria:**
- [ ] `/middleware.ts` refreshes Supabase session on each request
- [ ] Unauthenticated users accessing `/cart`, `/checkout`, `/admin/*` redirected to `/login`
- [ ] Non-admin users accessing `/admin/*` redirected to `/`
- [ ] Admin check queries `User` table for `isAdmin` flag
- [ ] Public routes (`/`, `/products`, `/login`) accessible without auth
- [ ] Typecheck passes

### US-006: Create sign out action
**Description:** As a user, I want to sign out so I can end my session.

**Acceptance Criteria:**
- [ ] `/app/actions/auth.ts` exports `signOut()` server action
- [ ] Calls `supabase.auth.signOut()` and redirects to `/login`
- [ ] Typecheck passes

### US-007: Create header with navigation and cart badge
**Description:** As a user, I want to see navigation and my cart item count so I can move around the app and know what's in my cart.

**Acceptance Criteria:**
- [ ] `/components/layout/header.tsx` shows logo linking to `/`
- [ ] Shows "Products" link to `/products`
- [ ] Shows cart icon linking to `/cart` with badge showing total item quantity
- [ ] Badge hidden when cart empty
- [ ] `/app/layout.tsx` updated to include Header component
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

### US-008: Create products list page
**Description:** As a user, I want to see all available products so I can browse and shop.

**Acceptance Criteria:**
- [ ] `/app/products/page.tsx` fetches active items from Supabase ordered by `number`
- [ ] Renders `ProductGrid` component with items
- [ ] `/components/products/product-grid.tsx` displays responsive grid (1-4 columns)
- [ ] Page title is "Raptors Spring 2026 Collection"
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

### US-009: Create product card with add-to-cart
**Description:** As a user, I want to see product details and add items to my cart with the correct options.

**Acceptance Criteria:**
- [ ] `/components/products/product-card.tsx` is a client component
- [ ] Shows item image (if available), name, and price formatted as currency
- [ ] Shows size dropdown if item has `sizes` array (required to add to cart)
- [ ] Shows player name and number inputs if item number is 1, 2, 10, or 19 (required to add to cart)
- [ ] Shows quantity input (min 1, max 99)
- [ ] "Add to Cart" button disabled until required fields filled
- [ ] Button shows loading state while adding
- [ ] Successful add resets form (quantity back to 1, player fields cleared)
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

### US-010: Create cart server actions
**Description:** As a developer, I need server actions for cart operations so the cart persists in the database.

**Acceptance Criteria:**
- [ ] `/app/actions/cart.ts` exports `getOrCreateCart()` - finds or creates OPEN order for current user
- [ ] Exports `addToCart(formData)` - validates input with zod, adds/increments OrderItem
- [ ] Exports `updateCartItem(formData)` - updates quantity/size of existing item
- [ ] Exports `removeFromCart(orderItemId)` - deletes OrderItem
- [ ] All mutations call `recalculateOrderTotal()` to update order total
- [ ] All mutations call `revalidatePath('/cart')` and `revalidatePath('/products')`
- [ ] Returns `{ success, error? }` object
- [ ] Typecheck passes

### US-011: Create shopping cart page
**Description:** As a user, I want to view my cart, modify quantities, and remove items so I can manage my order before checkout.

**Acceptance Criteria:**
- [ ] `/app/cart/page.tsx` redirects to `/login` if not authenticated
- [ ] Fetches cart via `getOrCreateCart()` and passes to `CartView`
- [ ] `/components/cart/cart-view.tsx` is a client component using `useOptimistic` for instant updates
- [ ] Shows empty cart message with link to products when cart empty
- [ ] Shows list of cart items with item name, size, player info, unit price, quantity input, line total
- [ ] Quantity changes update total immediately (optimistically)
- [ ] Remove button deletes item immediately (optimistically)
- [ ] Shows order summary with subtotal and total
- [ ] "Proceed to Checkout" button links to `/checkout`
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

### US-012: Create cart item row component
**Description:** As a user, I want each cart item to show all relevant details and allow editing.

**Acceptance Criteria:**
- [ ] `/components/cart/cart-item-row.tsx` shows item image, name, size, player info
- [ ] Shows unit price and line total (quantity x price)
- [ ] Quantity input allows changing (triggers `onQuantityChange` callback)
- [ ] Remove button (trash icon) triggers `onRemove` callback
- [ ] Disabled state while pending
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

### US-013: Create checkout page
**Description:** As a user, I want to review my order and submit it so I can complete my purchase.

**Acceptance Criteria:**
- [ ] `/app/checkout/page.tsx` redirects to `/login` if not authenticated
- [ ] Redirects to `/cart` if cart empty
- [ ] Shows order summary (item list with quantities and totals)
- [ ] `/components/checkout/checkout-form.tsx` is a client component
- [ ] Shows optional "Order Notes" textarea
- [ ] Shows total amount on submit button
- [ ] Submit button shows loading state while processing
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

### US-014: Create checkout action with email notification
**Description:** As a user, I want my order submission to notify the admin so they can process it.

**Acceptance Criteria:**
- [ ] `/app/actions/checkout.ts` exports `submitOrder(formData)` server action
- [ ] Updates order status from OPEN to PAID
- [ ] Saves optional note to order
- [ ] Sends email to `ADMIN_EMAIL` via Resend with order details
- [ ] Email includes: order ID, customer email, total, line items with sizes/player info
- [ ] Redirects to `/order-confirmation/[orderId]` on success
- [ ] Returns error if cart empty
- [ ] Typecheck passes

### US-015: Create order confirmation page
**Description:** As a user, I want to see confirmation after ordering so I know my order was received.

**Acceptance Criteria:**
- [ ] `/app/order-confirmation/[id]/page.tsx` shows success icon and message
- [ ] Displays order number and total
- [ ] Shows "Continue Shopping" button linking to `/products`
- [ ] Returns 404 if order not found
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

### US-016: Add shadcn table and checkbox components
**Description:** As a developer, I need table and checkbox components so I can build data tables.

**Acceptance Criteria:**
- [ ] Run `bunx shadcn@latest add table` successfully
- [ ] Run `bunx shadcn@latest add checkbox` successfully
- [ ] Components added to `components/ui/`
- [ ] Typecheck passes

### US-017: Create admin layout with navigation
**Description:** As an admin, I want a consistent admin interface with navigation so I can access different admin sections.

**Acceptance Criteria:**
- [ ] `/app/admin/layout.tsx` verifies user is authenticated and `isAdmin=true`
- [ ] Redirects non-admins to `/` and unauthenticated to `/login`
- [ ] Shows header with "Admin Dashboard" title and user email
- [ ] `/components/admin/admin-nav.tsx` is a client component with nav links
- [ ] Links to: Items (`/admin`), Orders (`/admin/orders`)
- [ ] Active link highlighted based on current route
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

### US-018: Create generic data table component
**Description:** As a developer, I need a reusable data table component so I can build admin tables consistently.

**Acceptance Criteria:**
- [ ] `/components/admin/data-table/data-table.tsx` wraps `@tanstack/react-table`
- [ ] Accepts: `columns`, `data`, `filterColumn`, `filterPlaceholder` props
- [ ] Supports column sorting via `getSortedRowModel`
- [ ] Supports filtering via `getFilteredRowModel`
- [ ] Supports pagination via `getPaginationRowModel`
- [ ] Supports row selection via `onRowSelectionChange`
- [ ] `/components/admin/data-table/data-table-pagination.tsx` shows page controls
- [ ] Typecheck passes

### US-019: Create items list page (admin dashboard)
**Description:** As an admin, I want to see all items in a table so I can manage the product catalog.

**Acceptance Criteria:**
- [ ] `/app/admin/page.tsx` fetches all items ordered by number
- [ ] `/app/admin/items/columns.tsx` defines columns: number, name, price (formatted), active (badge), sizes, actions
- [ ] `/app/admin/items/items-data-table.tsx` wraps DataTable with "New Item" button
- [ ] Table sortable by any column
- [ ] Actions column has dropdown with Edit/Delete options
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

### US-020: Create item form component
**Description:** As an admin, I want a form to create and edit items so I can manage the catalog.

**Acceptance Criteria:**
- [ ] `/components/admin/items/item-form.tsx` is a client component
- [ ] Fields: number (required), name (required), price in dollars (converted to cents), active toggle, sizes (comma-separated input), link (optional)
- [ ] In edit mode, pre-fills with existing values
- [ ] In create mode, fields empty
- [ ] Submit button shows "Create" or "Update" based on mode
- [ ] Loading state while submitting
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

### US-021: Create item CRUD server actions
**Description:** As a developer, I need server actions for item management.

**Acceptance Criteria:**
- [ ] `/app/admin/items/actions.ts` exports `createItem(formData)` - validates and inserts new item
- [ ] Exports `updateItem(id, formData)` - validates and updates existing item
- [ ] Exports `deleteItem(id)` - deletes item (fails if item has order items)
- [ ] All actions call `revalidatePath('/admin')`
- [ ] Returns `{ success, error? }` object
- [ ] Typecheck passes

### US-022: Create item create/edit pages
**Description:** As an admin, I want pages to create new items and edit existing ones.

**Acceptance Criteria:**
- [ ] `/app/admin/items/new/page.tsx` renders ItemForm in create mode
- [ ] `/app/admin/items/[itemId]/page.tsx` fetches item and renders ItemForm in edit mode
- [ ] Edit page returns 404 if item not found
- [ ] Success redirects back to `/admin`
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

### US-023: Create orders list page with filtering
**Description:** As an admin, I want to see all orders in a filterable table so I can manage order status.

**Acceptance Criteria:**
- [ ] `/app/admin/orders/page.tsx` fetches orders with user email, ordered by createdAt desc
- [ ] `/app/admin/orders/columns.tsx` defines columns: select (checkbox), ID, customer email, status (badge), total (formatted), date, actions
- [ ] Status badge colors: OPEN=secondary, PAID=default, ORDERED=outline, RECEIVED=secondary
- [ ] `/components/admin/orders/order-status-select.tsx` dropdown with all status options
- [ ] `/app/admin/orders/orders-data-table.tsx` includes status filter dropdown
- [ ] Filtering by status updates table immediately
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

### US-024: Create bulk order status update
**Description:** As an admin, I want to update multiple order statuses at once so I can efficiently process orders.

**Acceptance Criteria:**
- [ ] Orders table has select-all checkbox in header
- [ ] Individual rows have checkboxes
- [ ] When rows selected, "Update Status" button appears in toolbar
- [ ] `/components/admin/orders/bulk-status-update-dialog.tsx` shows confirmation dialog
- [ ] Dialog shows count of selected orders and status dropdown
- [ ] Confirming calls bulk update action
- [ ] Success deselects all rows and refreshes table
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

### US-025: Create order status update actions
**Description:** As a developer, I need server actions for updating order status.

**Acceptance Criteria:**
- [ ] `/app/admin/orders/actions.ts` exports `updateOrderStatus(orderId, status)` - updates single order
- [ ] Exports `bulkUpdateOrderStatus(orderIds, status)` - updates multiple orders
- [ ] Both update `updatedAt` timestamp
- [ ] Both call `revalidatePath('/admin/orders')`
- [ ] Returns `{ success, error? }` object
- [ ] Typecheck passes

### US-026: Create order detail page
**Description:** As an admin, I want to see full order details so I can review and process individual orders.

**Acceptance Criteria:**
- [ ] `/app/admin/orders/[orderId]/page.tsx` fetches order with user and orderItems (including item details)
- [ ] Returns 404 if order not found
- [ ] `/components/admin/orders/order-detail-card.tsx` shows order ID, status (with inline update), dates
- [ ] Shows customer email
- [ ] `/components/admin/orders/order-items-table.tsx` lists line items with: item name, size, player name/number, quantity, line total
- [ ] Shows order total
- [ ] Shows order note if present
- [ ] Typecheck passes
- [ ] Verify in browser using Chrome extension

---

## Functional Requirements

- FR-1: The system must authenticate users via Supabase magic link (email OTP)
- FR-2: The system must create a User record on first login, linked to Supabase auth via `supabaseId`
- FR-3: The system must set `isAdmin=true` for users whose email matches `ADMIN_EMAIL` environment variable
- FR-4: The system must protect `/admin/*` routes from non-admin users
- FR-5: The system must protect `/cart` and `/checkout` routes from unauthenticated users
- FR-6: The system must display all active items on `/products` page
- FR-7: The system must require size selection for items with defined sizes before adding to cart
- FR-8: The system must require player name and number for items 1, 2, 10, 19 (jerseys/hoodies) before adding to cart
- FR-9: The system must persist cart as an OPEN order in the database
- FR-10: The system must recalculate order total when cart items are added, updated, or removed
- FR-11: The system must update order status to PAID upon checkout submission
- FR-12: The system must send email notification to `ADMIN_EMAIL` upon order submission via Resend
- FR-13: The system must display order confirmation with order number and total after successful checkout
- FR-14: Admin users must be able to create, read, update, and delete items
- FR-15: Admin users must be able to view all orders with customer email and status
- FR-16: Admin users must be able to filter orders by status
- FR-17: Admin users must be able to update individual order status
- FR-18: Admin users must be able to bulk-update status for multiple selected orders
- FR-19: Admin users must be able to view full order details including line items

---

## Non-Goals (Out of Scope)

- Payment processing (Stripe, PayPal, etc.) - orders are submitted and paid offline
- Inventory management / stock tracking
- User registration without magic link (no password-based auth)
- User profile editing
- Order history page for customers
- Email confirmation to customers (only admin notification)
- Image upload for items (imageUrl set manually)
- Search functionality for products
- Product categories or filtering on storefront
- Guest checkout (login required)
- Shipping address collection
- Tax calculation

---

## Design Considerations

### UI Components to Reuse
- `components/ui/button.tsx` - Primary actions
- `components/ui/card.tsx` - Product cards, cart summary, order details
- `components/ui/input.tsx` - Form inputs
- `components/ui/select.tsx` - Size selection, status dropdowns
- `components/ui/field.tsx` - Form field layout with labels
- `components/ui/badge.tsx` - Order status indicators
- `components/ui/alert-dialog.tsx` - Bulk action confirmation

### Status Badge Colors
| Status | Badge Variant |
|--------|--------------|
| OPEN | secondary (gray) |
| PAID | default (primary) |
| ORDERED | outline |
| RECEIVED | secondary (gray) |

### Layout
- Public pages: Header with logo, Products link, Cart icon
- Admin pages: Header with title + user email, sidebar with Items/Orders links

---

## Technical Considerations

### Supabase Setup
- Server client uses `cookies()` from `next/headers` for session management
- Middleware client handles session refresh on each request
- Browser client for client-side auth operations (login form)

### Cart Architecture
- Cart = Order with status OPEN
- One OPEN order per user at a time
- Adding to cart creates OrderItem records
- Checkout updates status to PAID (cart becomes order)
- New OPEN order created on next add-to-cart

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ADMIN_EMAIL (comma-separated for multiple admins)
RESEND_API_KEY
```

### Data Table Library
- Using `@tanstack/react-table` for headless table logic
- Wrapped in shadcn-styled components
- Supports: sorting, filtering, pagination, row selection

---

## Success Metrics

- Users can complete login → browse → add to cart → checkout flow in under 2 minutes
- Admin can update order status in under 3 clicks
- Bulk status update processes 10+ orders in single action
- Email notification delivered within 30 seconds of order submission
