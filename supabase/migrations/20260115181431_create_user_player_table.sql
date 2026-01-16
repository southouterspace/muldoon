-- TABLE: UserPlayer (junction table for User <-> Player many-to-many)
CREATE TABLE IF NOT EXISTS "UserPlayer" (
    "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "playerId" UUID NOT NULL REFERENCES "Player"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("userId", "playerId")
);

-- INDEXES: UserPlayer
CREATE INDEX IF NOT EXISTS "UserPlayer_userId_idx" ON "UserPlayer" ("userId");
CREATE INDEX IF NOT EXISTS "UserPlayer_playerId_idx" ON "UserPlayer" ("playerId");
