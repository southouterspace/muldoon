"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { linkPlayerToUser } from "@/app/actions/players";
import { AddPlayerForm } from "@/components/onboarding/add-player-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Player } from "@/lib/types/database";

interface PlayerSelectionProps {
  players: Player[];
}

export function PlayerSelection({
  players: initialPlayers,
}: PlayerSelectionProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(
    new Set()
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);

  function handlePlayerToggle(playerId: string, checked: boolean): void {
    setSelectedPlayerIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(playerId);
      } else {
        next.delete(playerId);
      }
      return next;
    });
  }

  function handleNewPlayerAdded(player: Player): void {
    setPlayers((prev) => [...prev, player]);
    setSelectedPlayerIds((prev) => new Set(prev).add(player.id));
    setShowAddForm(false);
  }

  function handleContinue(): void {
    if (selectedPlayerIds.size === 0) {
      return;
    }

    startTransition(async () => {
      for (const playerId of selectedPlayerIds) {
        await linkPlayerToUser(playerId);
      }
      router.push("/");
    });
  }

  const hasSelection = selectedPlayerIds.size > 0;

  return (
    <div className="space-y-6">
      {/* Player List */}
      <Card>
        <CardContent className="max-h-96 overflow-y-auto p-0">
          {players.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No players found. Add a new player to get started.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {players.map((player) => {
                const checkboxId = `player-${player.id}`;
                return (
                  <li key={player.id}>
                    <label
                      className="flex cursor-pointer items-center gap-4 p-4 hover:bg-muted/50"
                      htmlFor={checkboxId}
                    >
                      <Checkbox
                        checked={selectedPlayerIds.has(player.id)}
                        disabled={isPending}
                        id={checkboxId}
                        onCheckedChange={(checked) =>
                          handlePlayerToggle(player.id, checked === true)
                        }
                      />
                      <div className="flex flex-1 items-center justify-between">
                        <div>
                          <span className="font-medium">
                            {player.firstName} {player.lastName}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          #{player.jerseyNumber}
                        </span>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Add New Player Form */}
      {showAddForm ? (
        <AddPlayerForm
          onCancel={() => setShowAddForm(false)}
          onSuccess={handleNewPlayerAdded}
        />
      ) : (
        <Button
          className="w-full"
          disabled={isPending}
          onClick={() => setShowAddForm(true)}
          variant="outline"
        >
          Add New Player
        </Button>
      )}

      {/* Continue Button */}
      <Button
        className="w-full"
        disabled={!hasSelection || isPending}
        onClick={handleContinue}
        size="lg"
      >
        {isPending ? "Linking..." : "Continue"}
      </Button>
    </div>
  );
}
