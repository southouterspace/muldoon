import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCachedUser } from "@/lib/supabase/cached";
import { ProductGridContent } from "./product-grid-content";
import { ProductGridSkeleton } from "./product-grid-skeleton";

export const revalidate = 3600; // ISR: revalidate every hour

export const metadata = {
  title: "Raptors Spring 2026 Collection",
  description: "Browse our spring 2026 merchandise collection",
};

export default async function HomePage(): Promise<React.ReactElement> {
  const {
    data: { user },
  } = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGridContent />
      </Suspense>
    </div>
  );
}
