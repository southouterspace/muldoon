"use client";

import { useCallback, useMemo, useState, useTransition } from "react";

import { DataTable } from "@/components/admin/data-table/data-table";
import { ORDER_STATUSES } from "@/components/admin/orders/order-status-select";
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
  const [rowSelection, setRowSelection] = useState({});

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

  // Status filter dropdown in toolbar
  const toolbar = (
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
    </div>
  );
}
