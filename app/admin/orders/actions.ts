"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types/database";

/**
 * Result type for order operations
 */
interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Zod schema for validating order status
 */
const orderStatusSchema = z.enum(["OPEN", "ORDERED", "RECEIVED"]);

/**
 * Update the status of a single order
 */
export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus
): Promise<ActionResult> {
  // Validate status
  const parsed = orderStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { success: false, error: "Invalid status value" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("Order")
    .update({
      status: parsed.data,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    return { success: false, error: "Failed to update order status" };
  }

  revalidatePath("/admin/orders");
  return { success: true };
}

/**
 * Update the status of multiple orders at once
 */
export async function bulkUpdateOrderStatus(
  orderIds: number[],
  status: OrderStatus
): Promise<ActionResult> {
  // Validate status
  const parsed = orderStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { success: false, error: "Invalid status value" };
  }

  // Validate orderIds array
  if (!orderIds || orderIds.length === 0) {
    return { success: false, error: "No orders selected" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("Order")
    .update({
      status: parsed.data,
      updatedAt: new Date().toISOString(),
    })
    .in("id", orderIds);

  if (error) {
    return { success: false, error: "Failed to update order statuses" };
  }

  revalidatePath("/admin/orders");
  return { success: true };
}

/**
 * Update the paid status of a single order
 */
export async function updateOrderPaid(
  orderId: number,
  paid: boolean
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("Order")
    .update({
      paid,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    return { success: false, error: "Failed to update order paid status" };
  }

  revalidatePath("/admin/orders");
  return { success: true };
}
