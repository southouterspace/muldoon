import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

/**
 * Get the total quantity of items in the user's cart
 */
async function getCartItemCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return 0;
    }

    // Get the user's database ID
    const { data: dbUser } = await supabase
      .from("User")
      .select("id")
      .eq("supabaseId", user.id)
      .single();

    if (!dbUser) {
      return 0;
    }

    // Get the user's open order (cart) and sum the quantities
    const { data: order } = await supabase
      .from("Order")
      .select("id")
      .eq("userId", dbUser.id)
      .eq("status", "OPEN")
      .single();

    if (!order) {
      return 0;
    }

    // Sum all order item quantities
    const { data: orderItems } = await supabase
      .from("OrderItem")
      .select("quantity")
      .eq("orderId", order.id);

    if (!orderItems) {
      return 0;
    }

    return orderItems.reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0
    );
  } catch {
    // Return 0 if Supabase is not configured or there's any error
    return 0;
  }
}

export async function Header(): Promise<React.ReactElement> {
  const cartItemCount = await getCartItemCount();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link className="font-bold text-xl" href="/">
            Raptors
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link className="relative" href="/cart">
            <ShoppingCart className="h-6 w-6" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 min-w-5 px-1.5">
                {cartItemCount}
              </Badge>
            )}
            <span className="sr-only">
              Cart{cartItemCount > 0 ? ` (${cartItemCount} items)` : ""}
            </span>
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
