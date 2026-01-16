# PRD: Performance Optimization

## Introduction

Comprehensive performance optimization for the Muldoon Next.js application based on Vercel React Best Practices audit. This PRD addresses async waterfalls, server-side performance, bundle size, and client-side re-render issues identified across the codebase.

## Goals

- Eliminate sequential database queries that could run in parallel
- Implement request deduplication with `React.cache()` for auth operations
- Use Next.js `after()` for non-blocking operations like email sending
- Remove dead code and console statements from production
- Optimize callback memoization to reduce unnecessary re-renders
- Improve page load times by 300-500ms on key pages

## User Stories

### CRITICAL Priority

---

### US-001: Parallelize Admin Orders Page Queries
**Description:** As an admin, I want the orders page to load faster by fetching orders and order items simultaneously.

**Acceptance Criteria:**
- [ ] Wrap orders and orderItems queries in `Promise.all()` at `app/admin/orders/page.tsx:47-82`
- [ ] Both queries execute concurrently instead of sequentially
- [ ] Error handling preserved for both query results
- [ ] Typecheck passes
- [ ] Page renders correctly with same data

---

### US-002: Parallelize Batch Item Updates
**Description:** As an admin, I want item reordering to complete quickly even with many items.

**Acceptance Criteria:**
- [ ] Refactor sequential loop at `app/admin/items/actions.ts:358-371` to use `Promise.all()`
- [ ] All item position updates execute concurrently
- [ ] Error handling aggregates failures appropriately
- [ ] Typecheck passes
- [ ] Reordering 10+ items completes in under 1 second

---

### HIGH Priority

---

### US-003: Implement React.cache() for Auth Deduplication
**Description:** As a developer, I want auth calls deduplicated per request to avoid redundant database queries.

**Acceptance Criteria:**
- [ ] Create cached `getUser()` wrapper using `React.cache()` in `lib/supabase/` or similar
- [ ] Replace direct `supabase.auth.getUser()` calls in server components with cached version
- [ ] Files to update: `app/(main)/page.tsx`, `app/(main)/cart/page.tsx`, `app/admin/layout.tsx`
- [ ] Single auth call per request instead of 2-4 calls
- [ ] Typecheck passes

---

### US-004: Non-blocking Email with Next.js after()
**Description:** As a user, I want checkout to redirect immediately without waiting for email to send.

**Acceptance Criteria:**
- [ ] Import `after` from `next/server` in `app/actions/checkout.ts`
- [ ] Move email sending logic (lines 159-164) inside `after()` callback
- [ ] Checkout redirect happens before email completes
- [ ] Email errors logged but don't block user flow
- [ ] Typecheck passes

---

### US-005: Fix Duplicate Auth Calls in Admin Layout
**Description:** As a developer, I want admin layout to make only one auth check instead of potentially 2-3.

**Acceptance Criteria:**
- [ ] Refactor `app/admin/layout.tsx:21-73` to avoid redundant `createClient()` and `getUser()` calls
- [ ] Return richer context from `getAdminUser()` to eliminate fallback auth check
- [ ] Single supabase client instantiation per request
- [ ] Typecheck passes

---

### US-006: Parallelize Order Detail Page Queries
**Description:** As an admin, I want order detail pages to load faster by fetching order and players in parallel.

**Acceptance Criteria:**
- [ ] Refactor `app/admin/orders/[orderId]/page.tsx:54-97` to use `Promise.all()`
- [ ] Order and userPlayers queries execute concurrently
- [ ] Error handling preserved
- [ ] Typecheck passes

---

### US-007: Delete Unused Demo Component
**Description:** As a developer, I want dead code removed to reduce bundle size and maintenance burden.

**Acceptance Criteria:**
- [ ] Delete `components/component-example.tsx` (492 lines, 28+ icon imports)
- [ ] Verify no imports reference this file
- [ ] Typecheck passes
- [ ] Build succeeds

---

### US-008: Remove Console Statements from Production
**Description:** As a developer, I want console.error statements removed per Ultracite code standards.

**Acceptance Criteria:**
- [ ] Remove `console.error` at `app/admin/orders/page.tsx:85`
- [ ] Remove `console.error` at `app/admin/page.tsx:16` and `:22`
- [ ] Remove `console.error` at `app/(main)/page.tsx:20`
- [ ] Remove `console.error` at `components/onboarding/player-selection.tsx:54`
- [ ] Remove `console.error` at `app/auth/callback/route.ts` (locate exact line)
- [ ] Remove `console.error` at `app/actions/checkout.ts:167`
- [ ] Typecheck passes
- [ ] Lint passes (`bun x ultracite check`)

---

### MEDIUM Priority

---

### US-009: Add Suspense Boundaries for Streaming
**Description:** As a user, I want pages to feel faster by streaming content progressively.

**Acceptance Criteria:**
- [ ] Add `<Suspense>` boundary around orders table in `app/admin/orders/page.tsx`
- [ ] Add `<Suspense>` boundary around product grid in `app/(main)/page.tsx`
- [ ] Add `<Suspense>` boundary around players table in `app/admin/players/page.tsx`
- [ ] Create appropriate skeleton/loading components for each boundary
- [ ] Typecheck passes
- [ ] Verify in browser - content streams progressively

---

### US-010: Fix Array Dependencies in ItemsDataTable
**Description:** As a developer, I want callbacks properly memoized to prevent unnecessary re-renders.

**Acceptance Criteria:**
- [ ] Memoize `positions` array with `useMemo` at `app/admin/items/items-data-table.tsx:121`
- [ ] Refactor callbacks at lines 42-102 to avoid full `items` array dependency where possible
- [ ] Use `items.length` instead of `items` where only length is needed
- [ ] Typecheck passes

---

### US-011: Memoize CartView Callbacks
**Description:** As a developer, I want cart callbacks memoized to prevent child re-renders.

**Acceptance Criteria:**
- [ ] Wrap `handleQuantityChange` in `useCallback` at `components/cart/cart-view.tsx:67`
- [ ] Wrap `handleRemove` in `useCallback` at `components/cart/cart-view.tsx:75`
- [ ] Verify dependencies are minimal and stable
- [ ] Typecheck passes

---

### US-012: Minimize Props Passed to Client Components
**Description:** As a developer, I want to reduce serialization overhead by passing only needed data to client components.

**Acceptance Criteria:**
- [ ] Review `Item` type passed to `ProductGridClient` at `app/(main)/page.tsx:37`
- [ ] Create slimmed-down `ProductItem` type with only client-needed fields if beneficial
- [ ] Measure serialized props size before/after (optional)
- [ ] Typecheck passes

---

## Functional Requirements

- FR-1: All independent database queries must use `Promise.all()` for parallel execution
- FR-2: Auth operations must be deduplicated per request using `React.cache()`
- FR-3: Non-blocking operations (email, logging) must use Next.js `after()` hook
- FR-4: Production code must not contain `console.log`, `console.error`, or `debugger` statements
- FR-5: Callbacks passed to child components should be memoized with `useCallback`
- FR-6: Array dependencies in hooks should use primitive values (length) where possible
- FR-7: Unused code must be deleted, not commented out

## Non-Goals

- No changes to Lucide-react import patterns (tree-shaking is handled by bundler)
- No migration to SWR/React Query (server components handle data fetching)
- No changes to database schema or query structure beyond parallelization
- No addition of caching layers (Redis, LRU) at this time
- No performance monitoring/APM integration in this phase

## Technical Considerations

- **React.cache()**: Only works in Server Components; creates per-request memoization
- **Next.js after()**: Available in Next.js 15+; runs after response is sent
- **Promise.all()**: Fails fast - if one promise rejects, all reject. Use `Promise.allSettled()` if partial success needed
- **useCallback dependencies**: Must include all values from component scope used inside callback

### Files to Modify

| File | Stories |
|------|---------|
| `app/admin/orders/page.tsx` | US-001, US-008, US-009 |
| `app/admin/items/actions.ts` | US-002 |
| `lib/supabase/cached.ts` (new) | US-003 |
| `app/actions/checkout.ts` | US-004, US-008 |
| `app/admin/layout.tsx` | US-005 |
| `app/admin/orders/[orderId]/page.tsx` | US-006 |
| `components/component-example.tsx` | US-007 (delete) |
| `app/admin/page.tsx` | US-008 |
| `app/(main)/page.tsx` | US-008, US-009, US-012 |
| `components/onboarding/player-selection.tsx` | US-008 |
| `app/auth/callback/route.ts` | US-008 |
| `app/admin/players/page.tsx` | US-009 |
| `app/admin/items/items-data-table.tsx` | US-010 |
| `components/cart/cart-view.tsx` | US-011 |

## Success Metrics

- Admin orders page load time reduced by 200ms+ (parallel queries)
- Checkout flow completes 100-500ms faster (non-blocking email)
- Auth calls per request reduced from 2-4 to 1 (React.cache)
- Zero console statements in production build
- All lint checks pass (`bun x ultracite check`)
- All type checks pass (`bun x tsc --noEmit`)

## Open Questions

1. Should `Promise.allSettled()` be used instead of `Promise.all()` for batch operations to allow partial success?
2. Is there a preferred error logging service to replace console.error (Sentry, LogRocket, etc.)?
3. Should skeleton components match exact layout or use generic placeholders?
