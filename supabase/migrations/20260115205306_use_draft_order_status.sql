-- Change default status for new orders to DRAFT
ALTER TABLE "Order" ALTER COLUMN status SET DEFAULT 'DRAFT';

-- Update any existing OPEN orders with no items to DRAFT
UPDATE "Order" o
SET status = 'DRAFT'
WHERE status = 'OPEN'
AND NOT EXISTS (
    SELECT 1 FROM "OrderItem" oi WHERE oi."orderId" = o.id
);
