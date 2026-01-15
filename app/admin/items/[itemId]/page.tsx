import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/types/database";
import { EditItemForm } from "./edit-item-form";

interface EditItemPageProps {
  params: Promise<{ itemId: string }>;
}

export default async function EditItemPage({
  params,
}: EditItemPageProps): Promise<React.ReactElement> {
  const { itemId } = await params;
  const id = Number.parseInt(itemId, 10);

  if (Number.isNaN(id)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: item, error } = await supabase
    .from("Item")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !item) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <EditItemForm item={item as Item} />
    </div>
  );
}
