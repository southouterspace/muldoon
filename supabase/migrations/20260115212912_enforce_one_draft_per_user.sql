-- Enforce one DRAFT order (cart) per user
-- This migration:
-- 1. Consolidates any existing duplicate DRAFT orders by moving items to the oldest
-- 2. Adds a partial unique index to prevent future duplicates

-- Step 1: Move OrderItems from duplicate DRAFT orders to the primary (oldest) DRAFT order per user
WITH primary_drafts AS (
  -- Get the oldest DRAFT order per user (this will be the "primary" cart)
  SELECT DISTINCT ON ("userId") id, "userId"
  FROM "Order"
  WHERE status = 'DRAFT'
  ORDER BY "userId", "createdAt" ASC, id ASC
),
duplicate_drafts AS (
  -- Get all DRAFT orders that are NOT the primary
  SELECT o.id AS duplicate_id, p.id AS primary_id
  FROM "Order" o
  JOIN primary_drafts p ON o."userId" = p."userId"
  WHERE o.status = 'DRAFT' AND o.id != p.id
)
UPDATE "OrderItem" oi
SET "orderId" = dd.primary_id
FROM duplicate_drafts dd
WHERE oi."orderId" = dd.duplicate_id;

-- Step 2: Recalculate totals for all DRAFT orders (in case items were moved)
UPDATE "Order" o
SET "totalCents" = COALESCE(
  (SELECT SUM("lineTotalCents") FROM "OrderItem" WHERE "orderId" = o.id),
  0
),
"updatedAt" = NOW()
WHERE o.status = 'DRAFT';

-- Step 3: Delete the now-empty duplicate DRAFT orders
WITH primary_drafts AS (
  SELECT DISTINCT ON ("userId") id, "userId"
  FROM "Order"
  WHERE status = 'DRAFT'
  ORDER BY "userId", "createdAt" ASC, id ASC
)
DELETE FROM "Order" o
WHERE o.status = 'DRAFT'
  AND o.id NOT IN (SELECT id FROM primary_drafts);

-- Step 4: Create partial unique index to enforce one DRAFT per user going forward
CREATE UNIQUE INDEX "Order_userId_draft_unique"
ON "Order" ("userId")
WHERE status = 'DRAFT';

-- Add comment explaining the constraint
COMMENT ON INDEX "Order_userId_draft_unique" IS
  'Ensures each user can have at most one DRAFT order (shopping cart) at a time';
