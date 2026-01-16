import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

interface HeaderData {
  cartItemCount: number;
  isAdmin: boolean;
}

/**
 * Get header data: cart item count and admin status
 */
async function getHeaderData(): Promise<HeaderData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { cartItemCount: 0, isAdmin: false };
    }

    // Get the user's database ID and admin status
    const { data: dbUser } = await supabase
      .from("User")
      .select("id, isadmin")
      .eq("supabaseid", user.id)
      .single();

    if (!dbUser) {
      return { cartItemCount: 0, isAdmin: false };
    }

    const isAdmin = dbUser.isadmin ?? false;

    // Get the user's draft order (cart) and sum the quantities
    const { data: order } = await supabase
      .from("Order")
      .select("id")
      .eq("userId", dbUser.id)
      .eq("status", "DRAFT")
      .limit(1);

    if (!order || order.length === 0) {
      return { cartItemCount: 0, isAdmin };
    }

    // Sum all order item quantities
    const { data: orderItems } = await supabase
      .from("OrderItem")
      .select("quantity")
      .eq("orderId", order[0].id);

    if (!orderItems) {
      return { cartItemCount: 0, isAdmin };
    }

    const cartItemCount = orderItems.reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0
    );

    return { cartItemCount, isAdmin };
  } catch {
    return { cartItemCount: 0, isAdmin: false };
  }
}

export async function Header(): Promise<React.ReactElement> {
  const { cartItemCount, isAdmin } = await getHeaderData();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Logo showText={false} size={48} />
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button asChild size="lg" variant="secondary">
              <Link href="/admin">Admin</Link>
            </Button>
          )}
          <Button asChild size="lg" variant="ghost">
            <Link href="/cart">
              <ShoppingCart />
              {cartItemCount}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
