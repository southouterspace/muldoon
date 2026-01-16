import { PageTitle } from "@/components/admin/page-title";
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

export default async function AdminPlayersPage(): Promise<React.ReactNode> {
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
    console.error("Error fetching players:", error);
    return (
      <div className="space-y-8">
        <PageTitle description="Failed to load players" title="Players" />
      </div>
    );
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

  return (
    <div className="space-y-8">
      <PageTitle description="Manage team roster" title="Players" />
      <PlayersDataTable players={playersWithEmails} />
    </div>
  );
}
