"use client";

import { useCallback, useMemo, useState, useTransition } from "react";

import { DataTable } from "@/components/admin/data-table/data-table";
import { BulkStatusUpdateDialog } from "@/components/admin/orders/bulk-status-update-dialog";
import { ORDER_STATUSES } from "@/components/admin/orders/order-status-select";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus } from "@/lib/types/database";

import { createColumns, type OrderRow } from "./columns";

interface OrdersDataTableProps {
  orders: OrderRow[];
}

export function OrdersDataTable({
  orders,
}: OrdersDataTableProps): React.ReactNode {
  const [, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  // Placeholder for status change - will be implemented in US-025
  const handleStatusChange = useCallback(
    (_orderId: number, _status: OrderStatus): Promise<void> => {
      return new Promise((resolve) => {
        startTransition(() => {
          // TODO: Call updateOrderStatus action (US-025)
          resolve();
        });
      });
    },
    []
  );

  // Placeholder for bulk status change - will be implemented in US-025
  const handleBulkStatusChange = useCallback(
    (_status: OrderStatus): Promise<void> => {
      // TODO: Call bulkUpdateOrderStatus action (US-025)
      // For now, just close the dialog and clear selection
      setRowSelection({});
      return Promise.resolve();
    },
    []
  );

  const columns = useMemo(
    () => createColumns(handleStatusChange),
    [handleStatusChange]
  );

  // Filter orders by status if not "all"
  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") {
      return orders;
    }
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  // Get selected order IDs from row selection
  const selectedOrderIds = useMemo(() => {
    return Object.entries(rowSelection)
      .filter(([, isSelected]) => isSelected)
      .map(([rowIndex]) => filteredOrders[Number(rowIndex)]?.id)
      .filter((id): id is number => id !== undefined);
  }, [rowSelection, filteredOrders]);

  const selectedCount = selectedOrderIds.length;

  // Status filter dropdown and bulk update button in toolbar
  const toolbar = (
    <div className="flex items-center gap-2">
      {selectedCount > 0 && (
        <Button onClick={() => setBulkDialogOpen(true)} variant="default">
          Update Status ({selectedCount})
        </Button>
      )}
      <Select onValueChange={setStatusFilter} value={statusFilter}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {ORDER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={filteredOrders}
        filterColumn="userEmail"
        filterPlaceholder="Filter by customer email..."
        onRowSelectionChange={setRowSelection}
        rowSelection={rowSelection}
        toolbar={toolbar}
      />
      <BulkStatusUpdateDialog
        onConfirm={handleBulkStatusChange}
        onOpenChange={setBulkDialogOpen}
        open={bulkDialogOpen}
        selectedCount={selectedCount}
        selectedOrderIds={selectedOrderIds}
      />
    </div>
  );
}
