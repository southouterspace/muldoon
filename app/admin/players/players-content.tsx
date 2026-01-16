import { createClient } from "@/lib/supabase/server";
import { PlayerCard } from "./player-card";

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
    .order("jerseyNumber", { ascending: true });

  if (error) {
    return <div className="text-destructive">Failed to load players</div>;
  }

  const playersData = (players ?? []) as PlayerFromDb[];

  if (playersData.length === 0) {
    return (
      <div className="text-center text-muted-foreground">No players found</div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {playersData.map((player) => (
        <PlayerCard
          fullName={`${player.firstName} ${player.lastName}`}
          jerseyNumber={player.jerseyNumber}
          key={player.id}
          linkedEmails={player.userPlayers
            .map((up) => up.user?.email)
            .filter(
              (email): email is string => email !== null && email !== undefined
            )
            .join(", ")}
        />
      ))}
    </div>
  );
}
