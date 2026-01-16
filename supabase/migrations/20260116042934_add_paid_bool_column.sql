-- Add paid boolean column to Order table
ALTER TABLE "Order" ADD COLUMN "paid" BOOLEAN NOT NULL DEFAULT false;

-- Migrate existing PAID orders: set paid=true and change status to OPEN
UPDATE "Order" SET "paid" = true, "status" = 'OPEN' WHERE "status" = 'PAID';
