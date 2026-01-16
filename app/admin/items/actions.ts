"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const STORAGE_BUCKET = "product-images";

/**
 * Result type for item operations
 */
interface ActionResult {
  success: boolean;
  error?: string;
}

interface ImageUploadResult {
  storagePath: string;
  publicUrl: string;
}

/**
 * Upload an image to Supabase Storage
 * @param supabase - Supabase client
 * @param itemId - Item ID for the storage path
 * @param file - Image file to upload
 * @returns Storage path and public URL, or null on error
 */
async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  itemId: string,
  file: File
): Promise<ImageUploadResult | null> {
  const storagePath = `items/${itemId}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, { upsert: true });

  if (uploadError) {
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: urlData.publicUrl,
  };
}

/**
 * Delete an image from Supabase Storage
 * @param supabase - Supabase client
 * @param storagePath - Path to the file in storage
 */
async function deleteImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storagePath: string
): Promise<void> {
  await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
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

  // Insert the item and get the new ID
  const { data: newItem, error } = await supabase
    .from("Item")
    .insert({
      number,
      name,
      costCents,
      active,
      sizes,
      link,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !newItem) {
    return { success: false, error: "Failed to create item" };
  }

  // Handle image upload if provided
  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploadResult = await uploadImage(supabase, newItem.id, imageFile);
    if (!uploadResult) {
      return { success: false, error: "Failed to upload image" };
    }

    // Update the item with image paths
    const { error: updateError } = await supabase
      .from("Item")
      .update({
        imageStoragePath: uploadResult.storagePath,
        imageUrl: uploadResult.publicUrl,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", newItem.id);

    if (updateError) {
      // Try to clean up the uploaded image
      await deleteImage(supabase, uploadResult.storagePath);
      return { success: false, error: "Failed to save image information" };
    }
  }

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Update an existing item in the catalog
 */
export async function updateItem(
  id: string,
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

  // Get current item to check for existing image
  const { data: currentItem } = await supabase
    .from("Item")
    .select("imageStoragePath")
    .eq("id", id)
    .single();

  // Handle image upload/deletion
  const imageFile = formData.get("image");
  const shouldDeleteImage = formData.get("deleteImage") === "true";

  let imageStoragePath: string | null | undefined;
  let imageUrl: string | null | undefined;

  if (imageFile instanceof File && imageFile.size > 0) {
    // Delete old image if exists
    if (currentItem?.imageStoragePath) {
      await deleteImage(supabase, currentItem.imageStoragePath);
    }

    // Upload new image
    const uploadResult = await uploadImage(supabase, id, imageFile);
    if (!uploadResult) {
      return { success: false, error: "Failed to upload image" };
    }
    imageStoragePath = uploadResult.storagePath;
    imageUrl = uploadResult.publicUrl;
  } else if (shouldDeleteImage && currentItem?.imageStoragePath) {
    // Delete existing image
    await deleteImage(supabase, currentItem.imageStoragePath);
    imageStoragePath = null;
    imageUrl = null;
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    number,
    name,
    costCents,
    active,
    sizes,
    link,
    updatedAt: new Date().toISOString(),
  };

  // Only include image fields if they changed
  if (imageStoragePath !== undefined) {
    updateData.imageStoragePath = imageStoragePath;
    updateData.imageUrl = imageUrl;
  }

  const { error } = await supabase.from("Item").update(updateData).eq("id", id);

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
export async function deleteItem(id: string): Promise<ActionResult> {
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
