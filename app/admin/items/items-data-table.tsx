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

  // Memoize a map from displayOrder to Item for O(1) lookups
  const itemsByDisplayOrder = useMemo(() => {
    const map = new Map<number, Item>();
    for (const item of items) {
      map.set(item.displayOrder, item);
    }
    return map;
  }, [items]);

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
      if (item.displayOrder <= 1) {
        return;
      }

      const previousItem = itemsByDisplayOrder.get(item.displayOrder - 1);
      if (!previousItem) {
        return;
      }

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
    [itemsByDisplayOrder]
  );

  const handleMoveDown = useCallback(
    (item: Item) => {
      const nextItem = itemsByDisplayOrder.get(item.displayOrder + 1);
      if (!nextItem) {
        return;
      }

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
    [itemsByDisplayOrder]
  );

  const canMoveUp = useCallback((item: Item) => {
    return item.displayOrder > 1;
  }, []);

  const canMoveDown = useCallback(
    (item: Item) => {
      return item.displayOrder < items.length;
    },
    [items.length]
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

  const positions = useMemo(
    () => Array.from({ length: items.length }, (_, i) => i + 1),
    [items.length]
  );

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
