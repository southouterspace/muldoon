import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ITEMS = 8;

export function ProductGridSkeleton(): React.ReactNode {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: SKELETON_ITEMS }).map((_, i) => (
        <Card key={`product-skeleton-${String(i)}`}>
          <CardHeader>
            {/* Image placeholder */}
            <Skeleton className="aspect-square w-full rounded-md" />
            {/* Title */}
            <Skeleton className="mt-2 h-6 w-3/4" />
            {/* Price badge */}
            <Skeleton className="h-5 w-16" />
          </CardHeader>

          <CardContent>
            <div className="flex gap-4">
              {/* Size selector placeholder */}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-9 w-full" />
              </div>
              {/* Quantity input placeholder */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </CardContent>

          <CardFooter>
            {/* Add to order button */}
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
