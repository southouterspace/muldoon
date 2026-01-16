import { PlusIcon } from "lucide-react";
import { PageTitle } from "@/components/admin/page-title";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/types/database";
import { ItemsDataTable } from "./items/items-data-table";

async function getItems(): Promise<Item[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("Item")
      .select("*")
      .order("displayOrder", { ascending: true });

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
    <div className="space-y-8">
      <PageTitle
        cta={{
          label: "New Item",
          href: "/admin/items/new",
          icon: <PlusIcon className="size-4" />,
        }}
        description="Manage your product catalog"
        title="Products"
      />
      <ItemsDataTable items={items} />
    </div>
  );
}
