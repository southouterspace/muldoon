import { ProductCard } from "@/components/products/product-card";
import type { Item } from "@/lib/types/database";

interface ProductGridProps {
  items: Item[];
  onAddToCart?: (data: {
    itemId: number;
    quantity: number;
    size: string | null;
    playerName: string | null;
    playerNumber: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function ProductGrid({
  items,
  onAddToCart,
}: ProductGridProps): React.ReactElement {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>No products available at this time.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ProductCard item={item} key={item.id} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
