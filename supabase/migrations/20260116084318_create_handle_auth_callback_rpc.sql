-- RPC: handle_auth_callback
-- Consolidates user upsert and linked players check into a single database call
-- Returns user_id and has_linked_players in one query

CREATE OR REPLACE FUNCTION handle_auth_callback(
    p_supabase_id TEXT,
    p_email TEXT,
    p_is_admin BOOLEAN
)
RETURNS TABLE (
    user_id INTEGER,
    has_linked_players BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id INTEGER;
    v_has_players BOOLEAN;
BEGIN
    -- Upsert user: insert if new, update if exists
    INSERT INTO "User" (supabaseid, email, isadmin, "createdAt", "updatedAt")
    VALUES (p_supabase_id, p_email, p_is_admin, NOW(), NOW())
    ON CONFLICT (supabaseid) DO UPDATE SET
        isadmin = EXCLUDED.isadmin,
        "updatedAt" = NOW()
    RETURNING id INTO v_user_id;

    -- Check if user has any linked players
    SELECT EXISTS (
        SELECT 1 FROM "UserPlayer" WHERE "userId" = v_user_id LIMIT 1
    ) INTO v_has_players;

    RETURN QUERY SELECT v_user_id, v_has_players;
END;
$$;
