"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OrderStatus } from "@/lib/types/database";
import { OrderStatusSelect } from "./order-status-select";

interface OrderDetailCardProps {
  orderId: number;
  status: OrderStatus;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  note: string | null;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderDetailCard({
  orderId,
  status,
  userEmail,
  createdAt,
  updatedAt,
  note,
}: OrderDetailCardProps): React.ReactNode {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(newStatus: OrderStatus): void {
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
        <CardDescription>Order #{orderId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground">Status</span>
            <OrderStatusSelect
              disabled={isPending}
              onStatusChange={handleStatusChange}
              value={status}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground">Customer</span>
            <span>{userEmail}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground">Created</span>
            <span>{formatDate(createdAt)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground">Updated</span>
            <span>{formatDate(updatedAt)}</span>
          </div>
        </div>

        {note ? (
          <div className="border-t pt-4">
            <span className="mb-2 block font-medium text-muted-foreground">
              Order Note
            </span>
            <p className="whitespace-pre-wrap text-sm">{note}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
