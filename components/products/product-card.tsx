"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Item } from "@/lib/types/database";
import { requiresPlayerInfo } from "@/lib/types/database";
import { formatCents } from "@/lib/utils/currency";

interface ProductCardProps {
  item: Item;
  onAddToCart?: (data: {
    itemId: number;
    quantity: number;
    size: string | null;
    playerName: string | null;
    playerNumber: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function ProductCard({
  item,
  onAddToCart,
}: ProductCardProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string>("");
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const hasSizes = item.sizes && item.sizes.length > 0;
  const needsPlayerInfo = requiresPlayerInfo(item.number);

  // Validate if all required fields are filled
  const isValid =
    quantity >= 1 &&
    quantity <= 99 &&
    (!hasSizes || size !== "") &&
    (!needsPlayerInfo ||
      (playerName.trim() !== "" && playerNumber.trim() !== ""));

  function resetForm(): void {
    setQuantity(1);
    setSize("");
    setPlayerName("");
    setPlayerNumber("");
    setError(null);
  }

  function handleAddToCart(): void {
    if (!onAddToCart) {
      setError("Add to cart is not available");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await onAddToCart({
        itemId: item.id,
        quantity,
        size: hasSizes ? size : null,
        playerName: needsPlayerInfo ? playerName.trim() : null,
        playerNumber: needsPlayerInfo ? playerNumber.trim() : null,
      });

      if (result.success) {
        resetForm();
      } else {
        setError(result.error || "Failed to add to cart");
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {item.imageUrl && (
        <div className="relative aspect-square bg-muted">
          <Image
            alt={item.name}
            className="object-cover"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            src={item.imageUrl}
          />
        </div>
      )}
      {!item.imageUrl && (
        <div className="flex aspect-square items-center justify-center bg-muted">
          <span className="text-muted-foreground">No image</span>
        </div>
      )}
      <div className="space-y-4 p-4">
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-muted-foreground">{formatCents(item.costCents)}</p>
        </div>

        {hasSizes && (
          <div className="space-y-2">
            <Label htmlFor={`size-${item.id}`}>Size</Label>
            <Select disabled={isPending} onValueChange={setSize} value={size}>
              <SelectTrigger className="w-full" id={`size-${item.id}`}>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {item.sizes?.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {needsPlayerInfo && (
          <>
            <div className="space-y-2">
              <Label htmlFor={`player-name-${item.id}`}>Player Name</Label>
              <Input
                disabled={isPending}
                id={`player-name-${item.id}`}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter player name"
                value={playerName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`player-number-${item.id}`}>Player Number</Label>
              <Input
                disabled={isPending}
                id={`player-number-${item.id}`}
                onChange={(e) => setPlayerNumber(e.target.value)}
                placeholder="Enter player number"
                value={playerNumber}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
          <Input
            disabled={isPending}
            id={`quantity-${item.id}`}
            max={99}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value))}
            type="number"
            value={quantity}
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          className="w-full"
          disabled={!isValid || isPending || !onAddToCart}
          onClick={handleAddToCart}
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Adding...
            </>
          ) : (
            "Add to Cart"
          )}
        </Button>
      </div>
    </div>
  );
}
