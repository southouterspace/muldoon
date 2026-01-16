"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { QuantityInput } from "@/components/ui/quantity-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Item } from "@/lib/types/database";
import { formatCents } from "@/lib/utils/currency";

interface ProductCardProps {
  item: Item;
  onAddToCart?: (data: {
    itemId: string;
    quantity: number;
    size: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function ProductCard({
  item,
  onAddToCart,
}: ProductCardProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const hasSizes = item.sizes && item.sizes.length > 0;

  const isValid = quantity >= 1 && quantity <= 99 && (!hasSizes || size !== "");

  function resetForm(): void {
    setQuantity(1);
    setSize("");
    setError(null);
  }

  function handleAddToCart(): void {
    if (!onAddToCart) {
      setError("Add to order is not available");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await onAddToCart({
        itemId: item.id,
        quantity: Number.parseInt(String(quantity), 10),
        size: hasSizes ? size : null,
      });

      if (result.success) {
        resetForm();
      } else {
        setError(result.error || "Failed to add to order");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        {item.imageUrl ? (
          <Image
            alt={item.name}
            className="aspect-square w-full rounded-md object-cover"
            height={256}
            src={item.imageUrl}
            width={256}
          />
        ) : (
          <div className="flex aspect-square items-center justify-center rounded-md bg-muted">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
        <CardTitle>{item.name}</CardTitle>
        <CardDescription>
          <Badge className="font-mono" variant="secondary">
            {formatCents(item.costCents)}
          </Badge>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <div className="flex gap-4">
            {hasSizes && (
              <Field>
                <FieldLabel htmlFor={`size-${item.id}`}>Size</FieldLabel>
                <Select
                  disabled={isPending}
                  onValueChange={setSize}
                  value={size}
                >
                  <SelectTrigger id={`size-${item.id}`} size="default">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {item.sizes?.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor={`quantity-${item.id}`}>Qty</FieldLabel>
              <QuantityInput
                disabled={isPending}
                id={`quantity-${item.id}`}
                onChange={setQuantity}
                value={quantity}
              />
            </Field>
          </div>

          {error && <FieldError>{error}</FieldError>}
        </FieldGroup>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          disabled={!isValid || isPending || !onAddToCart}
          onClick={handleAddToCart}
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Adding...
            </>
          ) : (
            "Add to Order"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
