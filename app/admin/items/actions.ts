"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Result type for item operations
 */
interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Zod schema for validating item input
 */
const itemSchema = z.object({
  number: z.coerce.number().int().positive(),
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  active: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  sizes: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") {
        return null;
      }
      return val
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }),
  link: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") {
        return null;
      }
      return val.trim();
    }),
});

/**
 * Create a new item in the catalog
 */
export async function createItem(formData: FormData): Promise<ActionResult> {
  const parsed = itemSchema.safeParse({
    number: formData.get("number"),
    name: formData.get("name"),
    price: formData.get("price"),
    active: formData.get("active") ?? "true",
    sizes: formData.get("sizes"),
    link: formData.get("link"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { success: false, error: firstError?.message ?? "Invalid input" };
  }

  const { number, name, price, active, sizes, link } = parsed.data;

  // Convert price from dollars to cents
  const costCents = Math.round(price * 100);

  const supabase = await createClient();

  // Check if item number already exists
  const { data: existingItem } = await supabase
    .from("Item")
    .select("id")
    .eq("number", number)
    .single();

  if (existingItem) {
    return { success: false, error: `Item number ${number} already exists` };
  }

  const { error } = await supabase.from("Item").insert({
    number,
    name,
    costCents,
    active,
    sizes,
    link,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  if (error) {
    return { success: false, error: "Failed to create item" };
  }

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Update an existing item in the catalog
 */
export async function updateItem(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  const parsed = itemSchema.safeParse({
    number: formData.get("number"),
    name: formData.get("name"),
    price: formData.get("price"),
    active: formData.get("active") ?? "true",
    sizes: formData.get("sizes"),
    link: formData.get("link"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { success: false, error: firstError?.message ?? "Invalid input" };
  }

  const { number, name, price, active, sizes, link } = parsed.data;

  // Convert price from dollars to cents
  const costCents = Math.round(price * 100);

  const supabase = await createClient();

  // Check if item number already exists for a different item
  const { data: existingItem } = await supabase
    .from("Item")
    .select("id")
    .eq("number", number)
    .neq("id", id)
    .single();

  if (existingItem) {
    return { success: false, error: `Item number ${number} already exists` };
  }

  const { error } = await supabase
    .from("Item")
    .update({
      number,
      name,
      costCents,
      active,
      sizes,
      link,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: "Failed to update item" };
  }

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Delete an item from the catalog
 * Fails if the item has associated order items
 */
export async function deleteItem(id: number): Promise<ActionResult> {
  const supabase = await createClient();

  // Check if item has any order items
  const { data: orderItems } = await supabase
    .from("OrderItem")
    .select("id")
    .eq("itemId", id)
    .limit(1);

  if (orderItems && orderItems.length > 0) {
    return {
      success: false,
      error:
        "Cannot delete item that has been ordered. Consider deactivating it instead.",
    };
  }

  const { error } = await supabase.from("Item").delete().eq("id", id);

  if (error) {
    return { success: false, error: "Failed to delete item" };
  }

  revalidatePath("/admin");
  return { success: true };
}
