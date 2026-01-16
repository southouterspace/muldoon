import { redirect } from "next/navigation";
import { getPlayers, getUserPlayers } from "@/app/actions/players";
import { createClient } from "@/lib/supabase/server";

export default async function PlayerSelectionPage(): Promise<React.ReactNode> {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user already has linked players
  const linkedPlayersResult = await getUserPlayers();
  if (
    linkedPlayersResult.success &&
    linkedPlayersResult.data &&
    linkedPlayersResult.data.length > 0
  ) {
    redirect("/");
  }

  // Fetch all players for selection
  const playersResult = await getPlayers();
  const players = playersResult.success ? (playersResult.data ?? []) : [];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-center font-bold text-3xl">
        Select Your Player
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        Choose your player profile to personalize your ordering experience.
      </p>
      {/* PlayerSelection client component will be added in US-006 */}
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Player selection UI coming soon. {players.length} players available.
      </div>
    </div>
  );
}
