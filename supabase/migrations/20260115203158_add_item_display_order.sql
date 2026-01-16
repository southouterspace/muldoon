-- Add displayOrder column for controlling product display order
ALTER TABLE "Item" ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;

-- Set initial order based on existing number column
UPDATE "Item" SET "displayOrder" = number;

-- Create index for efficient ordering
CREATE INDEX "Item_displayOrder_idx" ON "Item" ("displayOrder");
