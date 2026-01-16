"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import {
  removeFromCart,
  submitOrder,
  updateCartItem,
} from "@/app/actions/cart";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CartItem, CartWithItems } from "@/lib/types/database";
import { formatCents } from "@/lib/utils/currency";

interface CartViewProps {
  cart: CartWithItems | null;
}

type OptimisticAction =
  | { type: "updateQuantity"; orderItemId: number; quantity: number }
  | { type: "remove"; orderItemId: number };

export function CartView({ cart }: CartViewProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [optimisticItems, updateOptimisticItems] = useOptimistic<
    CartItem[],
    OptimisticAction
  >(cart?.orderItems ?? [], (state, action) => {
    if (action.type === "updateQuantity") {
      return state.map((item) => {
        if (item.id === action.orderItemId) {
          const newLineTotalCents = item.item.costCents * action.quantity;
          return {
            ...item,
            quantity: action.quantity,
            lineTotalCents: newLineTotalCents,
          };
        }
        return item;
      });
    }
    if (action.type === "remove") {
      return state.filter((item) => item.id !== action.orderItemId);
    }
    return state;
  });

  // Calculate totals from optimistic items
  const subtotal = optimisticItems.reduce(
    (sum, item) => sum + item.lineTotalCents,
    0
  );

  function handleQuantityChange(orderItemId: number, quantity: number): void {
    if (quantity < 1 || quantity > 99) {
      return;
    }

    startTransition(async () => {
      updateOptimisticItems({ type: "updateQuantity", orderItemId, quantity });

      const formData = new FormData();
      formData.set("orderItemId", String(orderItemId));
      formData.set("quantity", String(quantity));

      await updateCartItem(formData);
    });
  }

  function handleRemove(orderItemId: number): void {
    startTransition(async () => {
      updateOptimisticItems({ type: "remove", orderItemId });
      await removeFromCart(orderItemId);
    });
  }

  function handleSubmitOrder(): void {
    setError(null);
    startTransition(async () => {
      const result = await submitOrder();
      if (result.success) {
        router.push("/orders");
      } else {
        setError(result.error ?? "Failed to submit order");
      }
    });
  }

  // Empty cart state
  if (!cart || optimisticItems.length === 0) {
    return (
      <Card className="text-center">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          <div className="space-y-2">
            <h2 className="font-semibold text-xl">Your cart is empty</h2>
            <p className="text-muted-foreground">
              Add some items to get started
            </p>
          </div>
          <Button asChild className="mt-4">
            <Link href="/">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <Card>
        <CardHeader>
          <CardTitle>
            Cart Items ({optimisticItems.length}{" "}
            {optimisticItems.length === 1 ? "item" : "items"})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {optimisticItems.map((cartItem, index) => (
            <div key={cartItem.id}>
              {index > 0 && <Separator className="mb-4" />}
              <CartItemRow
                cartItem={cartItem}
                isPending={isPending}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="font-mono">{formatCents(subtotal)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          {error && (
            <div className="w-full rounded-md bg-destructive/10 p-3 text-destructive text-sm">
              {error}
            </div>
          )}
          <Button
            className="w-full"
            disabled={isPending}
            onClick={handleSubmitOrder}
            size="lg"
          >
            {isPending ? "Submitting..." : "Submit Order"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
