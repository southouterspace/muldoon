"use client";

import { useCallback, useMemo, useState, useTransition } from "react";

import { DataTable } from "@/components/admin/data-table/data-table";
import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import type { Item } from "@/lib/types/database";

import { deleteItem, moveToPosition, swapDisplayOrder } from "./actions";
import { createColumns } from "./columns";

interface ItemsDataTableProps {
  items: Item[];
}

export function ItemsDataTable({
  items,
}: ItemsDataTableProps): React.ReactNode {
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

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

  const handleMoveUp = useCallback(
    (item: Item) => {
      const currentIndex = items.findIndex((i) => i.id === item.id);
      if (currentIndex <= 0) {
        return;
      }

      const previousItem = items[currentIndex - 1];
      startTransition(async () => {
        const result = await swapDisplayOrder(
          item.id,
          item.displayOrder,
          previousItem.id,
          previousItem.displayOrder
        );
        if (!result.success && result.error) {
          setError(result.error);
        }
      });
    },
    [items]
  );

  const handleMoveDown = useCallback(
    (item: Item) => {
      const currentIndex = items.findIndex((i) => i.id === item.id);
      if (currentIndex < 0 || currentIndex >= items.length - 1) {
        return;
      }

      const nextItem = items[currentIndex + 1];
      startTransition(async () => {
        const result = await swapDisplayOrder(
          item.id,
          item.displayOrder,
          nextItem.id,
          nextItem.displayOrder
        );
        if (!result.success && result.error) {
          setError(result.error);
        }
      });
    },
    [items]
  );

  const canMoveUp = useCallback(
    (item: Item) => {
      const index = items.findIndex((i) => i.id === item.id);
      return index > 0;
    },
    [items]
  );

  const canMoveDown = useCallback(
    (item: Item) => {
      const index = items.findIndex((i) => i.id === item.id);
      return index >= 0 && index < items.length - 1;
    },
    [items]
  );

  const handleMoveToPosition = useCallback((item: Item, position: number) => {
    startTransition(async () => {
      const result = await moveToPosition(item.id, position);
      if (!result.success && result.error) {
        setError(result.error);
      }
    });
  }, []);

  const columns = useMemo(
    () =>
      createColumns({
        onDelete: handleDelete,
      }),
    [handleDelete]
  );

  const positions = Array.from({ length: items.length }, (_, i) => i + 1);

  const renderRowContextMenu = useCallback(
    (item: Item) => (
      <>
        <ContextMenuItem
          disabled={!canMoveUp(item)}
          onSelect={() => handleMoveUp(item)}
        >
          Move Up
        </ContextMenuItem>
        <ContextMenuItem
          disabled={!canMoveDown(item)}
          onSelect={() => handleMoveDown(item)}
        >
          Move Down
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          disabled={item.displayOrder === 1}
          onSelect={() => handleMoveToPosition(item, 1)}
        >
          Move to Beginning
        </ContextMenuItem>
        <ContextMenuItem
          disabled={item.displayOrder === items.length}
          onSelect={() => handleMoveToPosition(item, items.length)}
        >
          Move to End
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Move to Position</ContextMenuSubTrigger>
          <ContextMenuSubContent className="max-h-64 overflow-y-auto">
            {positions.map((pos) => (
              <ContextMenuItem
                disabled={pos === item.displayOrder}
                key={pos}
                onSelect={() => handleMoveToPosition(item, pos)}
              >
                {pos}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      </>
    ),
    [
      canMoveUp,
      canMoveDown,
      handleMoveUp,
      handleMoveDown,
      handleMoveToPosition,
      items.length,
      positions,
    ]
  );

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
        onRowSelectionChange={setRowSelection}
        renderRowContextMenu={renderRowContextMenu}
        rowSelection={rowSelection}
        tableId="admin-items"
      />
    </div>
  );
}
