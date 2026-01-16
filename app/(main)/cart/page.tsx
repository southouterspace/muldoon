import { redirect } from "next/navigation";
import { getOrCreateCart } from "@/app/actions/cart";
import { CartView } from "@/components/cart/cart-view";
import { getCachedUser } from "@/lib/supabase/cached";

export default async function CartPage(): Promise<React.ReactNode> {
  // Check authentication
  const {
    data: { user },
  } = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch cart data
  const cart = await getOrCreateCart();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 font-bold text-3xl">Your Cart</h1>
      <CartView cart={cart} />
    </div>
  );
}
