"use client";

import { Loader2Icon } from "lucide-react";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus } from "@/lib/types/database";

import { ORDER_STATUSES } from "./order-status-select";

interface BulkStatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  selectedOrderIds: number[];
  onConfirm: (status: OrderStatus) => Promise<void>;
}

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

export function BulkStatusUpdateDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
}: BulkStatusUpdateDialogProps): React.ReactNode {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const handleConfirm = (): void => {
    if (!selectedStatus) {
      return;
    }

    startTransition(async () => {
      await onConfirm(selectedStatus);
      setSelectedStatus(null);
      onOpenChange(false);
    });
  };

  const handleOpenChange = (newOpen: boolean): void => {
    if (!newOpen) {
      setSelectedStatus(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Update the status of {selectedCount} selected{" "}
            {selectedCount === 1 ? "order" : "orders"}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select
            onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
            value={selectedStatus ?? undefined}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  <Badge variant={getStatusBadgeVariant(status)}>
                    {status}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() => handleOpenChange(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={!selectedStatus || isPending}
            onClick={handleConfirm}
          >
            {isPending ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
