"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";

import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { OrderStatusSelect } from "@/components/admin/orders/order-status-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrderStatus } from "@/lib/types/database";
import { formatCents } from "@/lib/utils/currency";

/**
 * Order row type with user email included
 */
export interface OrderRow {
  id: number;
  userId: number;
  status: OrderStatus;
  totalCents: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
}

/**
 * Create columns with status change handler
 */
export function createColumns(
  onStatusChange: (orderId: number, status: OrderStatus) => Promise<void>
): ColumnDef<OrderRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">#{row.getValue("id")}</span>
      ),
    },
    {
      accessorKey: "userEmail",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as OrderStatus;
        const orderId = row.original.id;
        return (
          <OrderStatusSelect
            onStatusChange={(newStatus) => onStatusChange(orderId, newStatus)}
            value={status}
          />
        );
      },
      filterFn: (row, _id, value: string) => {
        if (value === "all") {
          return true;
        }
        return row.getValue("status") === value;
      },
    },
    {
      accessorKey: "totalCents",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => formatCents(row.getValue("totalCents")),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open actions menu"
                className="size-8 p-0"
                variant="ghost"
              >
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/orders/${order.id}`}>
                  <EyeIcon className="mr-2 size-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
