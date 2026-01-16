# PRD: Performance Optimization Phase 2

## Introduction

This PRD addresses remaining performance bottlenecks identified after the initial optimization work (US-001 through US-015). The primary issues are:

1. **Slow magic link callback** - Sequential database operations add 350-800ms to authentication
2. **No caching strategy** - Every page request hits the database even for rarely-changing data
3. **Suboptimal login page** - Performs unnecessary server-side auth check

These optimizations will significantly improve perceived and actual page load times.

## Goals

- Reduce magic link callback time by 40-60% through query optimization and parallel execution
- Implement ISR caching for product grid with 1-hour revalidation
- Implement ISR caching for admin players page with 1-hour revalidation
- Make login page fully static to eliminate server-side auth check
- Improve perceived speed with better loading states where applicable

## User Stories

### US-016: Create Supabase RPC for User Authentication Flow

**Description:** As a user clicking a magic link, I want authentication to complete faster so I can start using the app sooner.

**Acceptance Criteria:**
- [ ] Create Supabase database function `handle_auth_callback` that:
  - Accepts `supabase_id`, `email`, and `is_admin` parameters
  - Performs upsert on User table (INSERT ON CONFLICT UPDATE)
  - Returns user ID and whether user has linked players in single query
- [ ] Function uses single query with LEFT JOIN to check UserPlayer in same call
- [ ] Migration file created and runs successfully
- [ ] Typecheck passes

### US-017: Integrate RPC into Auth Callback Route

**Description:** As a developer, I want the auth callback to use the optimized RPC so users experience faster login.

**Acceptance Criteria:**
- [ ] Replace `getOrCreateUser()` and `hasLinkedPlayers()` with single RPC call
- [ ] RPC called immediately after `exchangeCodeForSession()` completes
- [ ] Error handling preserved for all failure cases
- [ ] Redirect logic unchanged (onboarding vs home)
- [ ] Typecheck passes
- [ ] Test magic link flow end-to-end in browser

### US-018: Add ISR Caching to Product Grid

**Description:** As a user browsing products, I want the page to load instantly from cache since products rarely change.

**Acceptance Criteria:**
- [ ] Add `export const revalidate = 3600` to product grid page (1 hour)
- [ ] Product data served from cache on subsequent requests
- [ ] Cache revalidates in background after 1 hour
- [ ] Admin item updates still trigger `revalidatePath('/')` for on-demand revalidation
- [ ] Typecheck passes
- [ ] Verify caching works by checking response headers or network tab

### US-019: Add ISR Caching to Admin Players Page

**Description:** As an admin viewing the roster, I want the page to load faster since player data rarely changes.

**Acceptance Criteria:**
- [ ] Add `export const revalidate = 3600` to admin players page (1 hour)
- [ ] Player data served from cache on subsequent requests
- [ ] Player mutations (link/unlink) call `revalidatePath('/admin/players')` for on-demand revalidation
- [ ] Typecheck passes

### US-020: Make Login Page Static

**Description:** As a user visiting the login page, I want it to load instantly without server-side processing.

**Acceptance Criteria:**
- [ ] Remove server-side `supabase.auth.getUser()` check from login page
- [ ] Add `export const dynamic = 'force-static'` to login page
- [ ] Redirect logic for authenticated users handled by middleware instead
- [ ] Login form still functions correctly
- [ ] Typecheck passes
- [ ] Verify in browser: login page loads without server round-trip

### US-021: Add Middleware Auth Redirect for Login Page

**Description:** As an authenticated user visiting /login, I want to be redirected to home without the page rendering.

**Acceptance Criteria:**
- [ ] Update or create middleware to check auth on /login route
- [ ] Redirect authenticated users to `/` before page renders
- [ ] Unauthenticated users see login page normally
- [ ] Middleware does not affect other routes negatively
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Create `handle_auth_callback` Supabase RPC function that performs user upsert and linked player check in single database round-trip
- FR-2: RPC must return `{ user_id: number, has_linked_players: boolean }` or error
- FR-3: Auth callback route must use RPC instead of separate queries
- FR-4: Product grid page must serve cached responses with 1-hour TTL
- FR-5: Admin players page must serve cached responses with 1-hour TTL
- FR-6: All mutation actions must call appropriate `revalidatePath()` for on-demand cache invalidation
- FR-7: Login page must be statically generated with no server-side data fetching
- FR-8: Middleware must redirect authenticated users away from /login

## Non-Goals

- No changes to the checkout flow (already optimized with `after()`)
- No changes to cart page caching (cart is user-specific, must be dynamic)
- No changes to order pages (order data is user-specific)
- No Redis or external caching layer (using Next.js built-in ISR)
- No prefetching or preloading optimizations in this phase
- No changes to client-side state management

## Technical Considerations

### Supabase RPC Function

The RPC should use PostgreSQL's `INSERT ... ON CONFLICT` (upsert) pattern:

```sql
-- Pseudocode for the RPC
INSERT INTO "User" (supabaseid, email, isadmin)
VALUES ($1, $2, $3)
ON CONFLICT (supabaseid)
DO UPDATE SET isadmin = $3, "updatedAt" = now()
RETURNING id;

-- Then check linked players with the returned id
```

### ISR Behavior

- `revalidate = 3600` means Next.js serves stale content while revalidating in background
- First request after TTL triggers background regeneration
- Users always get fast response (cached or stale-while-revalidate)

### Middleware Placement

- Middleware runs on Edge runtime
- Keep auth check lightweight (cookie presence, not full session validation)
- Full session validation happens in the page/layout

## Success Metrics

- Magic link callback completes in under 400ms (down from 600-800ms)
- Product grid page TTFB under 50ms for cached requests
- Admin players page TTFB under 50ms for cached requests
- Login page serves as static HTML with no server processing time
- No regression in functionality or user experience

## Open Questions

1. Should the RPC function also handle the `exchangeCodeForSession` step, or keep that separate for clearer error handling?
2. Is 1 hour the right cache TTL, or should it be configurable per environment?
3. Should we add cache-control headers for CDN caching in addition to ISR?
