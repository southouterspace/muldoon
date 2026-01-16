"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";

/**
 * Player row type with linked user emails
 */
export interface PlayerRow {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  linkedEmails: string;
}

/**
 * Column definitions for the players admin table (read-only)
 */
export const columns: ColumnDef<PlayerRow>[] = [
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Player Name" />
    ),
    cell: ({ row }) => {
      const firstName = row.original.firstName;
      const lastName = row.original.lastName;
      return `${firstName} ${lastName}`;
    },
  },
  {
    accessorKey: "jerseyNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jersey Number" />
    ),
    cell: ({ row }) => (
      <span className="font-mono">#{row.getValue("jerseyNumber")}</span>
    ),
  },
  {
    accessorKey: "linkedEmails",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Linked Users" />
    ),
    cell: ({ row }) => {
      const emails = row.getValue("linkedEmails") as string;
      return emails || <span className="text-muted-foreground">None</span>;
    },
  },
];
