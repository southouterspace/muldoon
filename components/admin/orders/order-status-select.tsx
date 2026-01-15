"use client";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus } from "@/lib/types/database";

interface OrderStatusSelectProps {
  value: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
  disabled?: boolean;
}

/**
 * All possible order status values
 */
export const ORDER_STATUSES: OrderStatus[] = [
  "OPEN",
  "PAID",
  "ORDERED",
  "RECEIVED",
];

/**
 * Get badge variant based on order status
 * OPEN=secondary, PAID=default, ORDERED=outline, RECEIVED=secondary
 */
function getStatusBadgeVariant(
  status: OrderStatus
): "default" | "secondary" | "outline" {
  if (status === "PAID") {
    return "default";
  }
  if (status === "ORDERED") {
    return "outline";
  }
  return "secondary";
}

export function OrderStatusSelect({
  value,
  onStatusChange,
  disabled = false,
}: OrderStatusSelectProps): React.ReactNode {
  return (
    <Select
      disabled={disabled}
      onValueChange={(newValue) => onStatusChange(newValue as OrderStatus)}
      value={value}
    >
      <SelectTrigger className="w-[130px]">
        <SelectValue>
          <Badge variant={getStatusBadgeVariant(value)}>{value}</Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
