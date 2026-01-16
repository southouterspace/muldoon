"use client";

import { useState, useTransition } from "react";
import { createPlayer } from "@/app/actions/players";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Player } from "@/lib/types/database";

interface AddPlayerFormProps {
  onCancel: () => void;
  onSuccess: (player: Player) => void;
}

export function AddPlayerForm({
  onCancel,
  onSuccess,
}: AddPlayerFormProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData): void {
    setError(null);

    startTransition(async () => {
      const result = await createPlayer(formData);
      if (result.success && result.data) {
        onSuccess(result.data);
      } else {
        setError(result.error ?? "Failed to create player");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Player</CardTitle>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              disabled={isPending}
              id="firstName"
              name="firstName"
              placeholder="Enter first name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              disabled={isPending}
              id="lastName"
              name="lastName"
              placeholder="Enter last name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jerseyNumber">Jersey Number</Label>
            <Input
              disabled={isPending}
              id="jerseyNumber"
              inputMode="numeric"
              name="jerseyNumber"
              placeholder="Enter jersey number"
              required
              type="number"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            className="flex-1"
            disabled={isPending}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button className="flex-1" disabled={isPending} type="submit">
            {isPending ? "Adding..." : "Add Player"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
