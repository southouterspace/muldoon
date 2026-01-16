"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Player } from "@/lib/types/database";

/**
 * Result type for player operations
 */
interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get the current authenticated user's ID from the User table
 */
async function getCurrentUserId(): Promise<number | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: dbUser } = await supabase
    .from("User")
    .select("id")
    .eq("supabaseid", user.id)
    .single();

  return dbUser?.id ?? null;
}

/**
 * Fetch all players ordered by lastName, firstName
 */
export async function getPlayers(): Promise<ActionResult<Player[]>> {
  const supabase = await createClient();

  const { data: players, error } = await supabase
    .from("Player")
    .select("*")
    .order("lastName", { ascending: true })
    .order("firstName", { ascending: true });

  if (error) {
    return { success: false, error: "Failed to fetch players" };
  }

  return { success: true, data: players as Player[] };
}

/**
 * Zod schema for validating createPlayer input
 */
const createPlayerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  jerseyNumber: z.coerce.number().int("Must be a whole number"),
});

/**
 * Create a new player and link to the current user
 */
export async function createPlayer(
  formData: FormData
): Promise<ActionResult<Player>> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = createPlayerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    jerseyNumber: formData.get("jerseyNumber"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { success: false, error: firstError?.message ?? "Invalid input" };
  }

  const { firstName, lastName, jerseyNumber } = parsed.data;

  const supabase = await createClient();

  // Create the player
  const { data: player, error: createError } = await supabase
    .from("Player")
    .insert({
      firstName,
      lastName,
      jerseyNumber,
    })
    .select()
    .single();

  if (createError || !player) {
    return { success: false, error: "Failed to create player" };
  }

  // Link to current user
  const { error: linkError } = await supabase.from("UserPlayer").insert({
    userId,
    playerId: player.id,
  });

  if (linkError) {
    return {
      success: false,
      error: "Player created but failed to link to user",
    };
  }

  revalidatePath("/onboarding/player");
  revalidatePath("/admin/players");

  return { success: true, data: player as Player };
}

/**
 * Link an existing player to the current user
 */
export async function linkPlayerToUser(
  playerId: string
): Promise<ActionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Verify player exists
  const { data: player } = await supabase
    .from("Player")
    .select("id")
    .eq("id", playerId)
    .single();

  if (!player) {
    return { success: false, error: "Player not found" };
  }

  // Check if already linked
  const { data: existingLink } = await supabase
    .from("UserPlayer")
    .select("userId, playerId")
    .eq("userId", userId)
    .eq("playerId", playerId)
    .single();

  if (existingLink) {
    return { success: true }; // Already linked, treat as success
  }

  // Create the link
  const { error } = await supabase.from("UserPlayer").insert({
    userId,
    playerId,
  });

  if (error) {
    return { success: false, error: "Failed to link player to user" };
  }

  revalidatePath("/onboarding/player");
  revalidatePath("/admin/players");

  return { success: true };
}

/**
 * Get all players linked to the current user
 */
export async function getUserPlayers(): Promise<ActionResult<Player[]>> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Query UserPlayer table and join with Player
  const { data: userPlayers, error } = await supabase
    .from("UserPlayer")
    .select(
      `
      player:Player(*)
    `
    )
    .eq("userId", userId);

  if (error) {
    return { success: false, error: "Failed to fetch user players" };
  }

  // Extract Player objects from the join result
  const players = userPlayers
    .map((up: { player: Player | null }) => up.player)
    .filter((p: Player | null): p is Player => p !== null);

  return { success: true, data: players };
}
