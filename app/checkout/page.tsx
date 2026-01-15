import { redirect } from "next/navigation";
import { getOrCreateCart } from "@/app/actions/cart";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { formatCents } from "@/lib/utils/currency";

export default async function CheckoutPage(): Promise<React.ReactNode> {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch cart data
  const cart = await getOrCreateCart();

  // Redirect to cart if empty
  if (!cart || cart.orderItems.length === 0) {
    redirect("/cart");
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 font-bold text-3xl">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.orderItems.map((item) => (
              <div className="flex justify-between text-sm" key={item.id}>
                <div className="flex-1">
                  <p className="font-medium">{item.item.name}</p>
                  <div className="text-muted-foreground text-xs">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.playerName && <span> | {item.playerName}</span>}
                    {item.playerNumber && <span> #{item.playerNumber}</span>}
                    <span> | Qty: {item.quantity}</span>
                  </div>
                </div>
                <p className="font-medium">
                  {formatCents(item.lineTotalCents)}
                </p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatCents(cart.totalCents)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form */}
        <CheckoutForm cart={cart} />
      </div>
    </div>
  );
}
