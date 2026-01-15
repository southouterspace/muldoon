-- ENUM: OrderStatus
CREATE TYPE "OrderStatus" AS ENUM ('OPEN', 'PAID', 'ORDERED', 'RECEIVED');

-- TABLE: User
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    supabaseId TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    isAdmin BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- TABLE: Item
CREATE TABLE "Item" (
    id SERIAL PRIMARY KEY,
    number INTEGER NOT NULL,
    name TEXT NOT NULL,
    "costCents" INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    "imageStoragePath" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- INDEX: Item.number
CREATE INDEX "Item_number_idx" ON "Item" (number);

-- TABLE: Order
CREATE TABLE "Order" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    status "OrderStatus" NOT NULL DEFAULT 'OPEN',
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    note TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- INDEXES: Order
CREATE INDEX "Order_userId_idx" ON "Order" ("userId");
CREATE INDEX "Order_status_idx" ON "Order" (status);

-- TABLE: OrderItem
CREATE TABLE "OrderItem" (
    id SERIAL PRIMARY KEY,
    "orderId" INTEGER NOT NULL REFERENCES "Order"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "itemId" INTEGER NOT NULL REFERENCES "Item"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    quantity INTEGER NOT NULL,
    size TEXT,
    "playerName" TEXT,
    "playerNumber" TEXT,
    "lineTotalCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- INDEXES: OrderItem
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem" ("orderId");
CREATE INDEX "OrderItem_itemId_idx" ON "OrderItem" ("itemId");
