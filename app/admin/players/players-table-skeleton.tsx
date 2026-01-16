import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = 8;

export function PlayersTableSkeleton(): React.ReactNode {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
        <div
          className="flex items-center gap-4 rounded-lg border bg-card p-4"
          key={`skeleton-${String(i)}`}
        >
          <Skeleton className="size-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="size-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}
