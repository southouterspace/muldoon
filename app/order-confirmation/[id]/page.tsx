import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatCents } from "@/lib/utils/currency";

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps): Promise<React.ReactNode> {
  const { id } = await params;
  const orderId = Number.parseInt(id, 10);

  // Validate orderId is a number
  if (Number.isNaN(orderId)) {
    notFound();
  }

  // Fetch order from database
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("Order")
    .select("id, totalCents, status")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <div className="container mx-auto flex max-w-lg items-center justify-center px-4 py-16">
      <Card className="w-full text-center">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          <CardDescription>
            Thank you for your order. We&apos;ve received your request and will
            process it shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-muted-foreground text-sm">Order Number</p>
            <p className="font-bold text-2xl">#{order.id}</p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-muted-foreground text-sm">Total</p>
            <p className="font-bold text-2xl">
              {formatCents(order.totalCents)}
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
