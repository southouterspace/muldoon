"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Item } from "@/lib/types/database";

interface ItemFormProps {
  item?: Item;
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string }>;
}

export function ItemForm({
  item,
  onSubmit,
}: ItemFormProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(item?.active ?? true);

  const isEditMode = Boolean(item);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("active", active.toString());

    startTransition(async () => {
      const result = await onSubmit(formData);
      if (!result.success && result.error) {
        setError(result.error);
      }
    });
  }

  // Convert cents to dollars for display
  const priceInDollars = item ? (item.costCents / 100).toFixed(2) : "";

  // Convert sizes array to comma-separated string
  const sizesString = item?.sizes?.join(", ") ?? "";

  function getButtonText(): string {
    if (isPending) {
      return isEditMode ? "Updating..." : "Creating...";
    }
    return isEditMode ? "Update" : "Create";
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Item" : "Create Item"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              defaultValue={item?.name ?? ""}
              disabled={isPending}
              id="name"
              name="name"
              placeholder="e.g., Jersey"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD) *</Label>
            <Input
              defaultValue={priceInDollars}
              disabled={isPending}
              id="price"
              min="0"
              name="price"
              placeholder="e.g., 49.99"
              required
              step="0.01"
              type="number"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={active}
              disabled={isPending}
              id="active"
              onCheckedChange={(checked) => setActive(checked === true)}
            />
            <Label className="cursor-pointer" htmlFor="active">
              Active
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sizes">Sizes (comma-separated)</Label>
            <Input
              defaultValue={sizesString}
              disabled={isPending}
              id="sizes"
              name="sizes"
              placeholder="e.g., S, M, L, XL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link (optional)</Label>
            <Input
              defaultValue={item?.link ?? ""}
              disabled={isPending}
              id="link"
              name="link"
              placeholder="e.g., https://example.com/product"
              type="url"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={isPending} type="submit">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getButtonText()}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
