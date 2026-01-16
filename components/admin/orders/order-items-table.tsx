import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCents } from "@/lib/utils/currency";

interface OrderItemForTable {
  id: number;
  itemId: number;
  quantity: number;
  size: string | null;
  playerName: string | null;
  playerNumber: string | null;
  lineTotalCents: number;
  item: {
    id: number;
    name: string;
    costCents: number;
  } | null;
}

interface LinkedPlayer {
  firstName: string;
  lastName: string;
  jerseyNumber: number;
}

interface OrderItemsTableProps {
  orderItems: OrderItemForTable[];
  totalCents: number;
  linkedPlayer?: LinkedPlayer | null;
}

function renderPlayerInfo(
  orderItem: OrderItemForTable,
  linkedPlayer?: LinkedPlayer | null
): React.ReactNode {
  // If order item has explicit player info, use it
  if (orderItem.playerName || orderItem.playerNumber) {
    return (
      <span>
        {orderItem.playerName}
        {orderItem.playerName && orderItem.playerNumber ? " #" : ""}
        {orderItem.playerNumber}
      </span>
    );
  }

  // If item has a size and user has a linked player, show that player's info
  if (orderItem.size && linkedPlayer) {
    return (
      <span>
        {linkedPlayer.lastName} #{linkedPlayer.jerseyNumber}
      </span>
    );
  }

  return "-";
}

export function OrderItemsTable({
  orderItems,
  totalCents,
  linkedPlayer,
}: OrderItemsTableProps): React.ReactNode {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Items</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderItems.map((orderItem) => (
              <TableRow key={orderItem.id}>
                <TableCell className="font-medium">
                  {orderItem.item?.name ?? "Unknown Item"}
                </TableCell>
                <TableCell>{orderItem.size ?? "-"}</TableCell>
                <TableCell>
                  {renderPlayerInfo(orderItem, linkedPlayer)}
                </TableCell>
                <TableCell className="text-right">
                  {orderItem.quantity}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono">
                    {formatCents(orderItem.lineTotalCents)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-between border-t">
        <span className="font-semibold">Order Total</span>
        <span className="font-bold font-mono text-lg">
          {formatCents(totalCents)}
        </span>
      </CardFooter>
    </Card>
  );
}
