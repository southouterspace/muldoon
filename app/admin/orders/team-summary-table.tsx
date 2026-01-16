import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { TeamSummaryItem } from "./page";

interface TeamSummaryTableProps {
  items: TeamSummaryItem[];
}

export function TeamSummaryTable({
  items,
}: TeamSummaryTableProps): React.ReactNode {
  if (items.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        No orders to display
      </div>
    );
  }

  // Calculate total quantity
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={`${item.itemName}|${item.size ?? ""}`}>
              <TableCell className="font-medium">{item.itemName}</TableCell>
              <TableCell>
                {item.size ? (
                  <Badge variant="outline">{item.size}</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono">
                {item.quantity}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted/50 font-semibold">
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell className="text-right font-mono">
              {totalQuantity}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
