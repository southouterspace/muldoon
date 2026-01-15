import { ProductGrid } from "@/components/products/product-grid";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/types/database";

export const metadata = {
  title: "Raptors Spring 2026 Collection",
  description: "Browse our spring 2026 merchandise collection",
};

async function getActiveItems(): Promise<Item[]> {
  try {
    const supabase = await createClient();
    const { data: items, error } = await supabase
      .from("Item")
      .select("*")
      .eq("active", true)
      .order("number", { ascending: true });

    if (error) {
      console.error("Error fetching items:", error);
      return [];
    }

    return (items as Item[]) || [];
  } catch {
    // Return empty array if Supabase is not configured
    return [];
  }
}

export default async function ProductsPage(): Promise<React.ReactElement> {
  const items = await getActiveItems();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 font-bold text-3xl">
        Raptors Spring 2026 Collection
      </h1>
      <ProductGrid items={items} />
    </div>
  );
}
