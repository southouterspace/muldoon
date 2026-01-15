"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { CartItem, CartWithItems } from "@/lib/types/database";

/**
 * Result type for cart operations
 */
interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Get the current authenticated user's ID from the User table
 */
async function getCurrentUserId(): Promise<number | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: dbUser } = await supabase
    .from("User")
    .select("id")
    .eq("supabaseId", user.id)
    .single();

  return dbUser?.id ?? null;
}

/**
 * Recalculate and update the order total based on its order items
 */
async function recalculateOrderTotal(orderId: number): Promise<void> {
  const supabase = await createClient();

  // Get all order items for this order
  const { data: orderItems } = await supabase
    .from("OrderItem")
    .select("lineTotalCents")
    .eq("orderId", orderId);

  // Calculate total
  const totalCents = (orderItems ?? []).reduce(
    (sum: number, item: { lineTotalCents: number }) =>
      sum + item.lineTotalCents,
    0
  );

  // Update the order total
  await supabase
    .from("Order")
    .update({ totalCents, updatedAt: new Date().toISOString() })
    .eq("id", orderId);
}

/**
 * Get or create an OPEN order (cart) for the current user
 */
export async function getOrCreateCart(): Promise<CartWithItems | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const supabase = await createClient();

  // Try to find existing OPEN order
  const { data: existingOrder } = await supabase
    .from("Order")
    .select(
      `
      *,
      orderItems:OrderItem(
        *,
        item:Item(*)
      )
    `
    )
    .eq("userId", userId)
    .eq("status", "OPEN")
    .single();

  if (existingOrder) {
    return existingOrder as unknown as CartWithItems;
  }

  // Create new OPEN order
  const { data: newOrder, error } = await supabase
    .from("Order")
    .insert({
      userId,
      status: "OPEN",
      totalCents: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !newOrder) {
    return null;
  }

  // Return the new order with empty orderItems
  return {
    ...newOrder,
    orderItems: [],
  } as CartWithItems;
}

/**
 * Zod schema for validating addToCart input
 */
const addToCartSchema = z.object({
  itemId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(99),
  size: z.string().nullable().optional(),
  playerName: z.string().nullable().optional(),
  playerNumber: z.string().nullable().optional(),
});

/**
 * Add an item to the cart
 */
export async function addToCart(formData: FormData): Promise<ActionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate input
  const parsed = addToCartSchema.safeParse({
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity"),
    size: formData.get("size") || null,
    playerName: formData.get("playerName") || null,
    playerNumber: formData.get("playerNumber") || null,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { itemId, quantity, size, playerName, playerNumber } = parsed.data;

  const supabase = await createClient();

  // Get the item to calculate line total
  const { data: item } = await supabase
    .from("Item")
    .select("costCents")
    .eq("id", itemId)
    .single();

  if (!item) {
    return { success: false, error: "Item not found" };
  }

  // Get or create cart
  const cart = await getOrCreateCart();

  if (!cart) {
    return { success: false, error: "Could not create cart" };
  }

  // Check if item with same options already exists in cart
  const existingItem = cart.orderItems.find(
    (oi: CartItem) =>
      oi.itemId === itemId &&
      oi.size === (size ?? null) &&
      oi.playerName === (playerName ?? null) &&
      oi.playerNumber === (playerNumber ?? null)
  );

  if (existingItem) {
    // Increment quantity
    const newQuantity = existingItem.quantity + quantity;
    const lineTotalCents = item.costCents * newQuantity;

    const { error } = await supabase
      .from("OrderItem")
      .update({ quantity: newQuantity, lineTotalCents })
      .eq("id", existingItem.id);

    if (error) {
      return { success: false, error: "Failed to update cart item" };
    }
  } else {
    // Create new order item
    const lineTotalCents = item.costCents * quantity;

    const { error } = await supabase.from("OrderItem").insert({
      orderId: cart.id,
      itemId,
      quantity,
      size: size ?? null,
      playerName: playerName ?? null,
      playerNumber: playerNumber ?? null,
      lineTotalCents,
      createdAt: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: "Failed to add item to cart" };
    }
  }

  // Recalculate order total
  await recalculateOrderTotal(cart.id);

  // Revalidate paths
  revalidatePath("/cart");
  revalidatePath("/products");

  return { success: true };
}

/**
 * Zod schema for validating updateCartItem input
 */
const updateCartItemSchema = z.object({
  orderItemId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(99),
  size: z.string().nullable().optional(),
});

/**
 * Update an existing cart item
 */
export async function updateCartItem(
  formData: FormData
): Promise<ActionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate input
  const parsed = updateCartItemSchema.safeParse({
    orderItemId: formData.get("orderItemId"),
    quantity: formData.get("quantity"),
    size: formData.get("size") || null,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { orderItemId, quantity, size } = parsed.data;

  const supabase = await createClient();

  // Get the order item with its order and item info
  const { data: orderItem } = await supabase
    .from("OrderItem")
    .select(
      `
      *,
      order:Order(*),
      item:Item(costCents)
    `
    )
    .eq("id", orderItemId)
    .single();

  if (!orderItem) {
    return { success: false, error: "Cart item not found" };
  }

  // Verify the order belongs to the user and is OPEN
  const order = orderItem.order as { userId: number; status: string };
  if (order.userId !== userId || order.status !== "OPEN") {
    return { success: false, error: "Cannot modify this cart item" };
  }

  // Calculate new line total
  const item = orderItem.item as { costCents: number };
  const lineTotalCents = item.costCents * quantity;

  // Update the order item
  const updateData: {
    quantity: number;
    lineTotalCents: number;
    size?: string | null;
  } = {
    quantity,
    lineTotalCents,
  };

  if (size !== undefined) {
    updateData.size = size ?? null;
  }

  const { error } = await supabase
    .from("OrderItem")
    .update(updateData)
    .eq("id", orderItemId);

  if (error) {
    return { success: false, error: "Failed to update cart item" };
  }

  // Recalculate order total
  await recalculateOrderTotal(orderItem.orderId);

  // Revalidate paths
  revalidatePath("/cart");
  revalidatePath("/products");

  return { success: true };
}

/**
 * Remove an item from the cart
 */
export async function removeFromCart(
  orderItemId: number
): Promise<ActionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Get the order item with its order info
  const { data: orderItem } = await supabase
    .from("OrderItem")
    .select(
      `
      *,
      order:Order(userId, status)
    `
    )
    .eq("id", orderItemId)
    .single();

  if (!orderItem) {
    return { success: false, error: "Cart item not found" };
  }

  // Verify the order belongs to the user and is OPEN
  const order = orderItem.order as { userId: number; status: string };
  if (order.userId !== userId || order.status !== "OPEN") {
    return { success: false, error: "Cannot modify this cart item" };
  }

  // Delete the order item
  const { error } = await supabase
    .from("OrderItem")
    .delete()
    .eq("id", orderItemId);

  if (error) {
    return { success: false, error: "Failed to remove item from cart" };
  }

  // Recalculate order total
  await recalculateOrderTotal(orderItem.orderId);

  // Revalidate paths
  revalidatePath("/cart");
  revalidatePath("/products");

  return { success: true };
}
