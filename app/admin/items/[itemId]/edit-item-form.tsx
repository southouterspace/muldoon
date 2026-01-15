"use client";

import { useRouter } from "next/navigation";
import { ItemForm } from "@/components/admin/items/item-form";
import type { Item } from "@/lib/types/database";
import { updateItem } from "../actions";

interface EditItemFormProps {
  item: Item;
}

export function EditItemForm({ item }: EditItemFormProps): React.ReactElement {
  const router = useRouter();

  async function handleSubmit(
    formData: FormData
  ): Promise<{ success: boolean; error?: string }> {
    const result = await updateItem(item.id, formData);
    if (result.success) {
      router.push("/admin");
    }
    return result;
  }

  return <ItemForm item={item} onSubmit={handleSubmit} />;
}
