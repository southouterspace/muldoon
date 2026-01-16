import { ProductGridClient } from "@/components/products/product-grid-client";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/types/database";

async function getActiveItems(): Promise<Item[]> {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("Item")
    .select("*")
    .eq("active", true)
    .order("displayOrder", { ascending: true });

  if (error) {
    return [];
  }

  return (items as Item[]) || [];
}

export async function ProductGridContent(): Promise<React.ReactNode> {
  const items = await getActiveItems();

  return <ProductGridClient items={items} />;
}
