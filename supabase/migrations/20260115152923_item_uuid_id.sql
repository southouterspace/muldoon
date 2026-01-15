-- Change Item.id from SERIAL to UUID
-- Also update OrderItem.itemId foreign key to match

-- Drop the foreign key constraint on OrderItem
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_itemId_fkey";

-- Add a temporary UUID column to Item
ALTER TABLE "Item" ADD COLUMN new_id UUID DEFAULT gen_random_uuid();

-- Update all existing rows with UUIDs
UPDATE "Item" SET new_id = gen_random_uuid() WHERE new_id IS NULL;

-- Drop the old primary key and id column
ALTER TABLE "Item" DROP CONSTRAINT "Item_pkey";
ALTER TABLE "Item" DROP COLUMN id;

-- Rename new_id to id and make it primary key
ALTER TABLE "Item" RENAME COLUMN new_id TO id;
ALTER TABLE "Item" ALTER COLUMN id SET NOT NULL;
ALTER TABLE "Item" ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "Item" ADD PRIMARY KEY (id);

-- Update OrderItem.itemId to UUID type
-- First, drop the column and recreate as UUID (no orders exist yet)
ALTER TABLE "OrderItem" DROP COLUMN "itemId";
ALTER TABLE "OrderItem" ADD COLUMN "itemId" UUID NOT NULL;

-- Recreate the foreign key constraint
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "Item"(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Recreate the index
DROP INDEX IF EXISTS "OrderItem_itemId_idx";
CREATE INDEX "OrderItem_itemId_idx" ON "OrderItem" ("itemId");
