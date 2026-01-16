import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SKELETON_ROWS = 8;
const SKELETON_COLUMNS = 3; // Player Name, Jersey Number, Linked Users

export function PlayersTableSkeleton(): React.ReactNode {
  return (
    <div className="space-y-4">
      {/* Toolbar skeleton - filter input */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-[250px]" />
        <div />
      </div>
      {/* Table skeleton */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: SKELETON_COLUMNS }).map((_, i) => (
                <TableHead key={`header-${String(i)}`}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
              <TableRow key={`row-${String(rowIndex)}`}>
                {/* Player Name */}
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                {/* Jersey Number */}
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                {/* Linked Users */}
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
