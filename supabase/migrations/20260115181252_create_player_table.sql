-- TABLE: Player
CREATE TABLE IF NOT EXISTS "Player" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "jerseyNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- INDEXES: Player
CREATE INDEX IF NOT EXISTS "Player_lastName_firstName_idx" ON "Player" ("lastName", "firstName");
CREATE INDEX IF NOT EXISTS "Player_jerseyNumber_idx" ON "Player" ("jerseyNumber");
