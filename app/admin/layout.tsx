import { Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCachedUser } from "@/lib/supabase/cached";
import { createClient } from "@/lib/supabase/server";

/**
 * Get current user's email and verify admin status
 */
async function getAdminUser(): Promise<{ email: string } | null> {
  try {
    const {
      data: { user },
    } = await getCachedUser();

    if (!user) {
      return null;
    }

    // Check if user exists and is admin
    // Note: PostgreSQL lowercases unquoted column names
    const supabase = await createClient();
    const { data: dbUser } = await supabase
      .from("User")
      .select("isadmin")
      .eq("supabaseid", user.id)
      .single();

    if (!dbUser?.isadmin) {
      return null;
    }

    return { email: user.email ?? "Admin" };
  } catch {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  const adminUser = await getAdminUser();

  if (!adminUser) {
    // Check if user is authenticated but not admin
    try {
      const {
        data: { user },
      } = await getCachedUser();

      if (user) {
        // User is authenticated but not admin
        redirect("/");
      } else {
        // User is not authenticated
        redirect("/login");
      }
    } catch {
      redirect("/login");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-background pt-safe pb-safe">
      {/* Desktop sidebar - hidden on mobile */}
      <aside className="hidden h-screen w-20 flex-col items-center border-r bg-gradient-to-b from-muted/40 to-muted/20 py-4 md:flex">
        <div className="mb-4">
          <Image
            alt="Raptors Logo"
            className="drop-shadow-md"
            height={56}
            priority
            src="/raptor-logo.png"
            width={56}
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              className="mb-4 size-12 p-0"
              size="lg"
              variant="ghost"
            >
              <Link href="/">
                <Store className="size-5" />
                <span className="sr-only">Go to Store</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Go to Store</p>
          </TooltipContent>
        </Tooltip>
        <div className="flex-1">
          <AdminNav />
        </div>
        <div className="mt-auto pt-4">
          <AdminUserMenu email={adminUser.email} />
        </div>
      </aside>

      {/* Main content area - with bottom padding on mobile for tab bar */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-6 md:px-6">{children}</div>
      </main>

      {/* Mobile bottom tab bar */}
      <AdminBottomNav email={adminUser.email} />
    </div>
  );
}
