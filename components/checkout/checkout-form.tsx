"use client";

import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CartWithItems } from "@/lib/types/database";
import { formatCents } from "@/lib/utils/currency";

interface CheckoutFormProps {
  cart: CartWithItems;
}

export function CheckoutForm({ cart }: CheckoutFormProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(() => {
      // TODO: US-014 will implement submitOrder action
      // For now, we'll just log the form data
      console.log("Order notes:", formData.get("note"));
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Complete Your Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note">Order Notes (optional)</Label>
            <Textarea
              className="min-h-[100px]"
              disabled={isPending}
              id="note"
              name="note"
              placeholder="Any special instructions for your order..."
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={isPending}
            size="lg"
            type="submit"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Place Order - {formatCents(cart.totalCents)}</>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
