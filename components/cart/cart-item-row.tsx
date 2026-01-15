"use client";

import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CartItem } from "@/lib/types/database";
import { formatCents } from "@/lib/utils/currency";

interface CartItemRowProps {
  cartItem: CartItem;
  isPending: boolean;
  onQuantityChange: (orderItemId: number, quantity: number) => void;
  onRemove: (orderItemId: number) => void;
}

export function CartItemRow({
  cartItem,
  isPending,
  onQuantityChange,
  onRemove,
}: CartItemRowProps): React.ReactElement {
  const unitPrice = cartItem.item.costCents;
  const lineTotal = cartItem.lineTotalCents;

  return (
    <div className="flex gap-4">
      {/* Item Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
        {cartItem.item.imageUrl ? (
          <Image
            alt={cartItem.item.name}
            className="object-cover"
            fill
            sizes="96px"
            src={cartItem.item.imageUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-muted-foreground text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-1">
          <h3 className="font-medium">{cartItem.item.name}</h3>
          <div className="flex flex-wrap gap-2 text-muted-foreground text-sm">
            {cartItem.size && <span>Size: {cartItem.size}</span>}
            {cartItem.playerName && <span>Player: {cartItem.playerName}</span>}
            {cartItem.playerNumber && <span>#{cartItem.playerNumber}</span>}
          </div>
          <p className="text-muted-foreground text-sm">
            {formatCents(unitPrice)} each
          </p>
        </div>
      </div>

      {/* Quantity and Actions */}
      <div className="flex flex-col items-end justify-between">
        <p className="font-semibold">{formatCents(lineTotal)}</p>
        <div className="flex items-center gap-2">
          <Input
            className="h-8 w-16 text-center"
            disabled={isPending}
            max={99}
            min={1}
            onChange={(e) =>
              onQuantityChange(cartItem.id, Number(e.target.value))
            }
            type="number"
            value={cartItem.quantity}
          />
          <Button
            disabled={isPending}
            onClick={() => onRemove(cartItem.id)}
            size="icon"
            variant="ghost"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="sr-only">Remove item</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
