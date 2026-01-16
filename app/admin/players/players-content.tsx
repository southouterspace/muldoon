import { createClient } from "@/lib/supabase/server";
import { PlayersDataTable } from "./players-data-table";

/**
 * Raw player data from Supabase with joined users via UserPlayer junction
 */
interface PlayerFromDb {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  createdAt: string;
  updatedAt: string;
  userPlayers: Array<{
    user: { email: string } | null;
  }>;
}

export async function PlayersContent(): Promise<React.ReactNode> {
  const supabase = await createClient();

  // Fetch players with linked user emails via UserPlayer junction table
  const { data: players, error } = await supabase
    .from("Player")
    .select(
      `
      id,
      firstName,
      lastName,
      jerseyNumber,
      createdAt,
      updatedAt,
      userPlayers:UserPlayer (
        user:User!UserPlayer_userId_fkey (
          email
        )
      )
    `
    )
    .order("lastName", { ascending: true })
    .order("firstName", { ascending: true });

  if (error) {
    return <div className="text-destructive">Failed to load players</div>;
  }

  // Transform data to flatten linked user emails for display
  const playersWithEmails = ((players ?? []) as PlayerFromDb[]).map(
    (player) => ({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      jerseyNumber: player.jerseyNumber,
      linkedEmails: player.userPlayers
        .map((up) => up.user?.email)
        .filter(
          (email): email is string => email !== null && email !== undefined
        )
        .join(", "),
    })
  );

  return <PlayersDataTable players={playersWithEmails} />;
}
