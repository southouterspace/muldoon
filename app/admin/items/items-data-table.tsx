"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/components/admin/data-table/data-table";
import { Button } from "@/components/ui/button";
import type { Item } from "@/lib/types/database";

import { columns } from "./columns";

interface ItemsDataTableProps {
  items: Item[];
}

export function ItemsDataTable({
  items,
}: ItemsDataTableProps): React.ReactNode {
  return (
    <DataTable
      columns={columns}
      data={items}
      filterColumn="name"
      filterPlaceholder="Filter items..."
      toolbar={
        <Button asChild>
          <Link href="/admin/items/new">
            <PlusIcon className="mr-2 size-4" />
            New Item
          </Link>
        </Button>
      }
    />
  );
}
