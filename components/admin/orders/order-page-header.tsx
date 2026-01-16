"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { PageTitle } from "@/components/admin/page-title";
import type { OrderStatus } from "@/lib/types/database";
import { OrderStatusSelect } from "./order-status-select";

interface OrderPageHeaderProps {
  orderId: number;
  status: OrderStatus;
  userEmail: string;
}

export function OrderPageHeader({
  orderId,
  status,
  userEmail,
}: OrderPageHeaderProps): React.ReactNode {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(newStatus: OrderStatus): void {
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
    });
  }

  return (
    <PageTitle
      action={
        <OrderStatusSelect
          disabled={isPending}
          onStatusChange={handleStatusChange}
          value={status}
        />
      }
      description={userEmail}
      title={`Order #${orderId}`}
    />
  );
}
