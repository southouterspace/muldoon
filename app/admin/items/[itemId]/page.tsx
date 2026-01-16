import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const supabase = await createClient();
  const { data: item, error } = await supabase
    .from("Item")
    .select("*")
    .eq("id", itemId)
    .single();

  if (error || !item) {
    notFound();
  }

  const typedItem = item as Item;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild size="icon" variant="ghost">
          <Link href="/admin">
            <ArrowLeft className="size-5" />
            <span className="sr-only">Back to Items</span>
          </Link>
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <h1 className="font-bold text-2xl tracking-tight">
            {typedItem.name}
          </h1>
          <Badge variant={typedItem.active ? "default" : "secondary"}>
            {typedItem.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <EditItemForm item={typedItem} />
    </div>
  );
}
