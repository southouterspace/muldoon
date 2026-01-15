import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { createClient } from "@/lib/supabase/server";

/**
 * Get current user's email and verify admin status
 */
async function getAdminUser(): Promise<{ email: string } | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Check if user exists and is admin
    const { data: dbUser } = await supabase
      .from("User")
      .select("isAdmin")
      .eq("supabaseId", user.id)
      .single();

    if (!dbUser?.isAdmin) {
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
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="w-64 border-r bg-muted/30">
        <div className="flex h-14 items-center border-b px-4">
          <h1 className="font-semibold">Admin Dashboard</h1>
        </div>
        <div className="p-2">
          <AdminNav />
        </div>
        <div className="mt-auto border-t p-4">
          <p className="truncate text-muted-foreground text-sm">
            {adminUser.email}
          </p>
        </div>
      </aside>
      <div className="flex-1">
        <div className="container py-6">{children}</div>
      </div>
    </div>
  );
}
