import { Suspense } from "react";
import { PageTitle } from "@/components/admin/page-title";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrdersContent } from "./orders-content";
import { OrdersTableSkeleton } from "./orders-table-skeleton";

export default function AdminOrdersPage(): React.ReactNode {
  return (
    <div className="space-y-8">
      <PageTitle description="View and manage customer orders" title="Orders" />
      <Tabs defaultValue="individual">
        <TabsList>
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        <Suspense fallback={<OrdersTableSkeleton />}>
          <OrdersContent />
        </Suspense>
      </Tabs>
    </div>
  );
}
