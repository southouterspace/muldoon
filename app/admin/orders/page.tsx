import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types/database";
import { OrdersDataTable } from "./orders-data-table";

/**
 * Raw order data from Supabase with joined user
 */
interface OrderFromDb {
  id: number;
  userId: number;
  status: OrderStatus;
  totalCents: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  user: { email: string } | null;
}

export default async function AdminOrdersPage(): Promise<React.ReactNode> {
  const supabase = await createClient();

  // Fetch orders with user email, ordered by createdAt desc
  const { data: orders, error } = await supabase
    .from("Order")
    .select(
      `
      id,
      userId,
      status,
      totalCents,
      note,
      createdAt,
      updatedAt,
      user:User!Order_userId_fkey (
        email
      )
    `
    )
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return (
      <div className="space-y-6">
        <h1 className="font-bold text-3xl">Orders</h1>
        <p className="text-muted-foreground">Failed to load orders.</p>
      </div>
    );
  }

  // Transform data to include user email at top level for easier access
  const ordersWithEmail = ((orders ?? []) as OrderFromDb[]).map((order) => ({
    id: order.id,
    userId: order.userId,
    status: order.status,
    totalCents: order.totalCents,
    note: order.note,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    userEmail: order.user?.email ?? "Unknown",
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-bold text-3xl">Orders</h1>
      <OrdersDataTable orders={ordersWithEmail} />
    </div>
  );
}
