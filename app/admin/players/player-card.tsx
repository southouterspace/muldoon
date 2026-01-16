"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayerCardProps {
  jerseyNumber: number;
  fullName: string;
  linkedEmails: string;
}

export function PlayerCard({
  jerseyNumber,
  fullName,
  linkedEmails,
}: PlayerCardProps): React.ReactNode {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted font-mono font-semibold text-sm">
        #{jerseyNumber}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium">{fullName}</div>
        <div className="truncate text-muted-foreground text-sm">
          {linkedEmails || "No linked users"}
        </div>
      </div>
      <Button size="icon-sm" variant="ghost">
        <MoreHorizontal className="size-4" />
        <span className="sr-only">Actions</span>
      </Button>
    </div>
  );
}
