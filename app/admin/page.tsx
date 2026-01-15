import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/types/database";

import { ItemsDataTable } from "./items/items-data-table";

async function getItems(): Promise<Item[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("Item")
      .select("*")
      .order("number", { ascending: true });

    if (error) {
      console.error("Error fetching items:", error);
      return [];
    }

    return (data as Item[]) ?? [];
  } catch {
    console.error("Supabase not configured");
    return [];
  }
}

export default async function AdminItemsPage(): Promise<React.ReactElement> {
  const items = await getItems();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl">Items</h2>
        <p className="text-muted-foreground">Manage your product catalog.</p>
      </div>
      <ItemsDataTable items={items} />
    </div>
  );
}
