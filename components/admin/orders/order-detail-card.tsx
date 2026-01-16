import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OrderDetailCardProps {
  createdAt: string;
  updatedAt: string;
  note: string | null;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderDetailCard({
  createdAt,
  updatedAt,
  note,
}: OrderDetailCardProps): React.ReactNode {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
        <CardDescription>Order information and notes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground">Created</span>
            <span>{formatDate(createdAt)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground">Updated</span>
            <span>{formatDate(updatedAt)}</span>
          </div>
        </div>

        {note ? (
          <div className="border-t pt-4">
            <span className="mb-2 block font-medium text-muted-foreground">
              Order Note
            </span>
            <p className="whitespace-pre-wrap text-sm">{note}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
