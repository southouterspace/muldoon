import Image from "next/image";
import type { Item } from "@/lib/types/database";
import { formatCents } from "@/lib/utils/currency";

interface ProductGridProps {
  items: Item[];
}

export function ProductGrid({ items }: ProductGridProps): React.ReactElement {
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
        <div
          className="overflow-hidden rounded-lg border bg-card"
          key={item.id}
        >
          {item.imageUrl && (
            <div className="relative aspect-square bg-muted">
              <Image
                alt={item.name}
                className="object-cover"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                src={item.imageUrl}
              />
            </div>
          )}
          {!item.imageUrl && (
            <div className="flex aspect-square items-center justify-center bg-muted">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
          <div className="p-4">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-muted-foreground">
              {formatCents(item.costCents)}
            </p>
            {item.sizes && item.sizes.length > 0 && (
              <p className="mt-1 text-muted-foreground text-sm">
                Sizes: {item.sizes.join(", ")}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
