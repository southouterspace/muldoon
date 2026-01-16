"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";

import { DataTable } from "@/components/admin/data-table/data-table";
import { Button } from "@/components/ui/button";
import type { Item } from "@/lib/types/database";

import { deleteItem } from "./actions";
import { createColumns } from "./columns";

interface ItemsDataTableProps {
  items: Item[];
}

export function ItemsDataTable({
  items,
}: ItemsDataTableProps): React.ReactNode {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback((id: string): Promise<void> => {
    setError(null);
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await deleteItem(id);
        if (!result.success && result.error) {
          setError(result.error);
        }
        resolve();
      });
    });
  }, []);

  const columns = useMemo(() => createColumns(handleDelete), [handleDelete]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
          {error}
        </div>
      )}
      <DataTable
        columns={columns}
        data={items}
        filterColumn="name"
        filterPlaceholder="Filter items..."
        toolbar={
          <Button asChild disabled={isPending}>
            <Link href="/admin/items/new">
              <PlusIcon className="mr-2 size-4" />
              New Item
            </Link>
          </Button>
        }
      />
    </div>
  );
}
