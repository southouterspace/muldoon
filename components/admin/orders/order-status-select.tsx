"use client";

import { ChevronDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrderStatus } from "@/lib/types/database";

interface OrderStatusSelectProps {
  value: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
  disabled?: boolean;
}

/**
 * All possible order status values (excluding DRAFT which is internal)
 */
export const ORDER_STATUSES: OrderStatus[] = ["OPEN", "ORDERED", "RECEIVED"];

/**
 * Get badge variant based on order status
 */
function getStatusBadgeVariant(
  status: OrderStatus
): "default" | "secondary" | "outline" {
  if (status === "ORDERED") {
    return "default";
  }
  if (status === "RECEIVED") {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={disabled} size="lg" variant="outline">
          <Badge variant={getStatusBadgeVariant(value)}>{value}</Badge>
          <ChevronDownIcon className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ORDER_STATUSES.map((status) => (
          <DropdownMenuItem
            className="focus:bg-transparent data-[highlighted]:bg-transparent"
            key={status}
            onClick={() => onStatusChange(status)}
          >
            <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
