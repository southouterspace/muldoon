"use client";

import { DataTable } from "@/components/admin/data-table/data-table";
import { columns, type PlayerRow } from "./columns";

interface PlayersDataTableProps {
  players: PlayerRow[];
}

export function PlayersDataTable({
  players,
}: PlayersDataTableProps): React.ReactNode {
  return (
    <DataTable
      columns={columns}
      data={players}
      filterColumn="lastName"
      filterPlaceholder="Filter by last name..."
    />
  );
}
