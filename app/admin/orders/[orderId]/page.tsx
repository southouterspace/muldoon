import { notFound } from "next/navigation";
import { OrderDetailCard } from "@/components/admin/orders/order-detail-card";
import { OrderItemsTable } from "@/components/admin/orders/order-items-table";
import { OrderPageHeader } from "@/components/admin/orders/order-page-header";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types/database";

/**
 * Raw order data from Supabase with joined user, user's players, and order items
 */
interface OrderFromDb {
  id: number;
  userId: number;
  status: OrderStatus;
  totalCents: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
    userPlayers: Array<{
      player: {
        firstName: string;
        lastName: string;
        jerseyNumber: number;
      } | null;
    }>;
  } | null;
  orderItems: Array<{
    id: number;
    itemId: number;
    quantity: number;
    size: string | null;
    playerName: string | null;
    playerNumber: string | null;
    lineTotalCents: number;
    item: {
      id: number;
      name: string;
      costCents: number;
    } | null;
  }>;
}

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps): Promise<React.ReactNode> {
  const { orderId } = await params;

  // Validate order ID
  const orderIdNum = Number.parseInt(orderId, 10);
  if (Number.isNaN(orderIdNum)) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch order with user (including user's players) and order items in a single query
  const { data: order, error } = await supabase
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
        email,
        userPlayers:UserPlayer (
          player:Player (
            firstName,
            lastName,
            jerseyNumber
          )
        )
      ),
      orderItems:OrderItem (
        id,
        itemId,
        quantity,
        size,
        playerName,
        playerNumber,
        lineTotalCents,
        item:Item (
          id,
          name,
          costCents
        )
      )
    `
    )
    .eq("id", orderIdNum)
    .single();

  if (error || !order) {
    notFound();
  }

  const typedOrder = order as unknown as OrderFromDb;

  // Get the first linked player (primary player) from the nested user data
  const userPlayers = typedOrder.user?.userPlayers ?? [];
  const linkedPlayer = userPlayers.length > 0 ? userPlayers[0].player : null;

  return (
    <div className="space-y-8">
      <OrderPageHeader
        orderId={typedOrder.id}
        status={typedOrder.status}
        userEmail={typedOrder.user?.email ?? "Unknown"}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <OrderDetailCard
          createdAt={typedOrder.createdAt}
          note={typedOrder.note}
          updatedAt={typedOrder.updatedAt}
        />

        <OrderItemsTable
          linkedPlayer={linkedPlayer}
          orderItems={typedOrder.orderItems}
          totalCents={typedOrder.totalCents}
        />
      </div>
    </div>
  );
}
