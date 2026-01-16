"use client";

import {
  Check,
  ChevronDown,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import type { ProductItem } from "@/lib/types/database";
import { cn } from "@/lib/utils";
import { formatCents } from "@/lib/utils/currency";

interface ProductCardProps {
  item: ProductItem;
  onAddToCart?: (data: {
    itemId: string;
    quantity: number;
    size: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
}

function AddButtonContent({
  showSuccess,
  isPending,
}: {
  showSuccess: boolean;
  isPending: boolean;
}): React.ReactElement {
  if (showSuccess) {
    return (
      <>
        <Check className="h-4 w-4" strokeWidth={2.5} />
        <span>Added</span>
      </>
    );
  }
  if (isPending) {
    return (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Adding</span>
      </>
    );
  }
  return (
    <>
      <ShoppingBag className="h-4 w-4" strokeWidth={2} />
      <span>Add</span>
    </>
  );
}

export function ProductCard({
  item,
  onAddToCart,
}: ProductCardProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

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
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          resetForm();
        }, 1500);
      } else {
        setError(result.error || "Failed to add to order");
      }
    });
  }

  return (
    <article
      className={cn(
        "group relative",
        "rounded-2xl",
        "bg-white",
        "border border-neutral-200",
        "shadow-sm",
        "hover:border-neutral-300 hover:shadow-md",
        "transition-shadow duration-300"
      )}
    >
      {/* Main content wrapper */}
      <div className="flex flex-col gap-4 p-4">
        {/* Row 1: Image, Name, Price */}
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="relative shrink-0">
            <div
              className={cn(
                "relative h-20 w-20 sm:h-24 sm:w-24",
                "overflow-hidden rounded-xl",
                "bg-white"
              )}
            >
              {item.imageUrl ? (
                <Image
                  alt={item.name}
                  className="object-contain"
                  fill
                  sizes="(max-width: 640px) 80px, 96px"
                  src={item.imageUrl}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingBag
                    className="h-6 w-6 text-neutral-300"
                    strokeWidth={2}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Name & Price */}
          <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
            <h3
              className={cn(
                "self-center",
                "font-semibold text-neutral-900",
                "text-sm sm:text-base",
                "leading-tight",
                "line-clamp-2"
              )}
            >
              {item.name}
            </h3>
            <p
              className={cn(
                "shrink-0 font-semibold text-neutral-900",
                "text-sm sm:text-base",
                "leading-tight"
              )}
            >
              {formatCents(item.costCents)}
            </p>
          </div>
        </div>

        {/* Row 2: Size, Qty, Add Button */}
        <div className="flex items-center gap-4">
          {/* Size Selector - same width as image */}
          {hasSizes && (
            <div className="relative w-20 shrink-0 sm:w-24">
              <button
                aria-expanded={sizeOpen}
                aria-haspopup="listbox"
                aria-label="Select size"
                className={cn(
                  "flex h-9 w-full items-center justify-between px-3",
                  "rounded-lg",
                  "bg-white",
                  "border border-neutral-200",
                  "font-medium text-sm",
                  size ? "text-neutral-900" : "text-neutral-500",
                  "hover:border-neutral-300 hover:bg-neutral-50",
                  "focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2",
                  "transition-colors duration-150",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                disabled={isPending}
                onClick={() => setSizeOpen(!sizeOpen)}
                type="button"
              >
                <span>{size || "Size"}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-neutral-400",
                    "transition-transform duration-200",
                    sizeOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Size Dropdown */}
              {sizeOpen && (
                <>
                  <button
                    aria-label="Close size selector"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setSizeOpen(false)}
                    type="button"
                  />
                  <div
                    className={cn(
                      "absolute top-full left-0 z-50 mt-1",
                      "min-w-[120px]",
                      "rounded-lg",
                      "bg-white",
                      "border border-neutral-200",
                      "shadow-lg",
                      "py-1"
                    )}
                    role="listbox"
                  >
                    {item.sizes?.map((s) => (
                      <button
                        aria-selected={size === s}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm",
                          "hover:bg-neutral-100",
                          "transition-colors duration-100",
                          size === s
                            ? "bg-neutral-50 font-semibold text-neutral-900"
                            : "text-neutral-700"
                        )}
                        key={s}
                        onClick={() => {
                          setSize(s);
                          setSizeOpen(false);
                        }}
                        role="option"
                        type="button"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Quantity Stepper */}
          <div
            className={cn(
              "flex h-9 items-center",
              "rounded-lg",
              "bg-white",
              "border border-neutral-200",
              "overflow-hidden"
            )}
          >
            <button
              aria-label="Decrease quantity"
              className={cn(
                "flex h-9 w-9 items-center justify-center",
                "text-neutral-600",
                "hover:bg-neutral-100 hover:text-neutral-900",
                "active:bg-neutral-200",
                "transition-colors duration-100",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              )}
              disabled={isPending || quantity <= 1}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              type="button"
            >
              <Minus className="h-4 w-4" strokeWidth={2} />
            </button>
            <span
              aria-live="polite"
              className={cn(
                "w-8 text-center",
                "font-semibold text-sm",
                "text-neutral-900"
              )}
            >
              {quantity}
            </span>
            <button
              aria-label="Increase quantity"
              className={cn(
                "flex h-9 w-9 items-center justify-center",
                "text-neutral-600",
                "hover:bg-neutral-100 hover:text-neutral-900",
                "active:bg-neutral-200",
                "transition-colors duration-100",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              )}
              disabled={isPending || quantity >= 99}
              onClick={() => setQuantity(Math.min(99, quantity + 1))}
              type="button"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            aria-disabled={!isValid || isPending || !onAddToCart}
            className={cn(
              "ml-auto",
              "flex h-9 items-center justify-center gap-2 px-4",
              "rounded-lg",
              "font-semibold text-sm",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              showSuccess
                ? "bg-emerald-500 text-white focus:ring-emerald-500"
                : "bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-900 active:bg-neutral-950",
              !((isValid && onAddToCart) || isPending || showSuccess) &&
                "cursor-not-allowed opacity-50 hover:bg-neutral-900"
            )}
            disabled={!isValid || isPending || !onAddToCart || showSuccess}
            onClick={handleAddToCart}
            type="button"
          >
            <AddButtonContent isPending={isPending} showSuccess={showSuccess} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-sm" role="alert">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
