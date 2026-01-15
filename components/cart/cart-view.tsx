"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { removeFromCart, updateCartItem } from "@/app/actions/cart";
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
  const [isPending, startTransition] = useTransition();

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
            <Link href="/products">Browse Products</Link>
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
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCents(subtotal)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatCents(subtotal)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" size="lg">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
