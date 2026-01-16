import { Suspense } from "react";
import { PageTitle } from "@/components/admin/page-title";
import { PlayersContent } from "./players-content";
import { PlayersTableSkeleton } from "./players-table-skeleton";

export const revalidate = 3600;

export default function AdminPlayersPage(): React.ReactNode {
  return (
    <div className="space-y-8">
      <PageTitle description="Manage team roster" title="Players" />
      <Suspense fallback={<PlayersTableSkeleton />}>
        <PlayersContent />
      </Suspense>
    </div>
  );
}
