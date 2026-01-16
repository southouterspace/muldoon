import { ProductGridClient } from "@/components/products/product-grid-client";
import { createClient } from "@/lib/supabase/server";
import type { ProductItem } from "@/lib/types/database";

async function getActiveItems(): Promise<ProductItem[]> {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("Item")
    .select("id, name, costCents, imageUrl, sizes")
    .eq("active", true)
    .order("displayOrder", { ascending: true });

  if (error) {
    return [];
  }

  return (items as ProductItem[]) || [];
}

export async function ProductGridContent(): Promise<React.ReactNode> {
  const items = await getActiveItems();

  return <ProductGridClient items={items} />;
}
