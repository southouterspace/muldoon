"use client";

import { addToCart } from "@/app/actions/cart";
import { ProductGrid } from "@/components/products/product-grid";
import type { ProductItem } from "@/lib/types/database";

interface ProductGridClientProps {
  items: ProductItem[];
}

export function ProductGridClient({
  items,
}: ProductGridClientProps): React.ReactElement {
  async function handleAddToCart(data: {
    itemId: string;
    quantity: number;
    size: string | null;
  }): Promise<{ success: boolean; error?: string }> {
    const formData = new FormData();
    formData.set("itemId", String(data.itemId));
    formData.set("quantity", String(data.quantity));
    if (data.size) {
      formData.set("size", data.size);
    }

    return await addToCart(formData);
  }

  return <ProductGrid items={items} onAddToCart={handleAddToCart} />;
}
