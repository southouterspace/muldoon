"use client";

import { useRouter } from "next/navigation";
import { ItemForm } from "@/components/admin/items/item-form";
import { createItem } from "../actions";

export default function NewItemPage(): React.ReactElement {
  const router = useRouter();

  async function handleSubmit(
    formData: FormData
  ): Promise<{ success: boolean; error?: string }> {
    const result = await createItem(formData);
    if (result.success) {
      router.push("/admin");
    }
    return result;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ItemForm onSubmit={handleSubmit} />
    </div>
  );
}
