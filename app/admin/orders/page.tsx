import { PageTitle } from "@/components/admin/page-title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types/database";
import { OrdersDataTable } from "./orders-data-table";
import { TeamSummaryTable } from "./team-summary-table";

/**
 * Raw order data from Supabase with joined user
 */
interface OrderFromDb {
  id: number;
  userId: number;
  status: OrderStatus;
  paid: boolean;
  totalCents: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  user: { email: string } | null;
}

/**
 * Raw order item data for team summary
 */
interface OrderItemFromDb {
  id: number;
  quantity: number;
  size: string | null;
  item: { id: string; name: string } | null;
  order: { status: OrderStatus } | null;
}

/**
 * Aggregated item for team summary
 */
export interface TeamSummaryItem {
  itemName: string;
  size: string | null;
  quantity: number;
}

export default async function AdminOrdersPage(): Promise<React.ReactNode> {
  const supabase = await createClient();

  // Fetch orders and order items in parallel for better performance
  const [ordersResult, orderItemsResult] = await Promise.all([
    // Fetch orders with user email, ordered by createdAt desc
    supabase
      .from("Order")
      .select(
        `
        id,
        userId,
        status,
        paid,
        totalCents,
        note,
        createdAt,
        updatedAt,
        user:User!Order_userId_fkey (
          email
        )
      `
      )
      .order("createdAt", { ascending: false }),

    // Fetch order items for team summary (exclude DRAFT orders)
    supabase
      .from("OrderItem")
      .select(
        `
        id,
        quantity,
        size,
        item:Item!OrderItem_itemId_fkey (
          id,
          name
        ),
        order:Order!OrderItem_orderId_fkey (
          status
        )
      `
      ),
  ]);

  const { data: orders, error: ordersError } = ordersResult;
  const { data: orderItems, error: itemsError } = orderItemsResult;

  if (ordersError || itemsError) {
    console.error("Error fetching data:", ordersError ?? itemsError);
    return (
      <div className="space-y-8">
        <PageTitle description="Failed to load orders" title="Orders" />
      </div>
    );
  }

  // Transform data to include user email at top level for easier access
  const ordersWithEmail = ((orders ?? []) as OrderFromDb[]).map((order) => ({
    id: order.id,
    userId: order.userId,
    status: order.status,
    paid: order.paid,
    totalCents: order.totalCents,
    note: order.note,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    userEmail: order.user?.email ?? "Unknown",
  }));

  // Aggregate order items by item name and size (only OPEN status)
  const teamSummaryMap = new Map<string, TeamSummaryItem>();
  for (const orderItem of (orderItems ?? []) as OrderItemFromDb[]) {
    // Only include OPEN orders
    if (orderItem.order?.status !== "OPEN") {
      continue;
    }

    const itemName = orderItem.item?.name ?? "Unknown Item";
    const size = orderItem.size;
    const key = `${itemName}|${size ?? ""}`;

    const existing = teamSummaryMap.get(key);
    if (existing) {
      existing.quantity += orderItem.quantity;
    } else {
      teamSummaryMap.set(key, {
        itemName,
        size,
        quantity: orderItem.quantity,
      });
    }
  }

  const teamSummary = Array.from(teamSummaryMap.values()).sort((a, b) => {
    // Sort by item name, then by size
    const nameCompare = a.itemName.localeCompare(b.itemName);
    if (nameCompare !== 0) {
      return nameCompare;
    }
    if (a.size === null) {
      return -1;
    }
    if (b.size === null) {
      return 1;
    }
    return a.size.localeCompare(b.size);
  });

  return (
    <div className="space-y-8">
      <PageTitle description="View and manage customer orders" title="Orders" />
      <Tabs defaultValue="individual">
        <TabsList>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        <TabsContent className="mt-6" value="individual">
          <OrdersDataTable orders={ordersWithEmail} />
        </TabsContent>
        <TabsContent className="mt-6" value="team">
          <TeamSummaryTable items={teamSummary} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
