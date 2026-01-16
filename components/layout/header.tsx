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
  const { MobileNav } = await import("@/components/layout/mobile-nav");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo - visible on all sizes */}
        <Logo showText={false} size={48} />

        {/* Desktop navigation - hidden on mobile */}
        <div className="hidden items-center gap-2 md:flex">
          {isAdmin && (
            <Button asChild size="lg" variant="secondary">
              <Link href="/admin">Admin</Link>
            </Button>
          )}
          <Button asChild className="relative" size="lg" variant="ghost">
            <Link href="/cart">
              <ShoppingCart className="size-5" />
              <span className="ml-1 tabular-nums">{cartItemCount}</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground md:hidden">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>
          </Button>
        </div>

        {/* Mobile navigation - visible only on mobile */}
        <MobileNav cartItemCount={cartItemCount} isAdmin={isAdmin} />
      </div>
    </header>
  );
}
