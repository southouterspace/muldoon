import { redirect } from "next/navigation";
import { ProductGridClient } from "@/components/products/product-grid-client";
import { getCachedUser } from "@/lib/supabase/cached";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/types/database";

export const metadata = {
  title: "Raptors Spring 2026 Collection",
  description: "Browse our spring 2026 merchandise collection",
};

async function getActiveItems(): Promise<Item[]> {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("Item")
    .select("*")
    .eq("active", true)
    .order("displayOrder", { ascending: true });

  if (error) {
    console.error("Error fetching items:", error);
    return [];
  }

  return (items as Item[]) || [];
}

export default async function HomePage(): Promise<React.ReactElement> {
  const {
    data: { user },
  } = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const items = await getActiveItems();

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductGridClient items={items} />
    </div>
  );
}
