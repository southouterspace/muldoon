-- Remove the number column from Item table (replaced by displayOrder)
DROP INDEX IF EXISTS "Item_number_idx";
ALTER TABLE "Item" DROP COLUMN IF EXISTS "number";
