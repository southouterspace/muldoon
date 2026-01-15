"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton(): React.ReactElement {
  return (
    <form action="/auth/logout" method="POST">
      <Button size="sm" type="submit" variant="ghost">
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Log out</span>
      </Button>
    </form>
  );
}
