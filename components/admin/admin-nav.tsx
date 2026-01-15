"use client";

import { Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Items",
    href: "/admin",
    icon: Package,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
] as const;

export function AdminNav(): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin" || pathname.startsWith("/admin/items")
            : pathname.startsWith(item.href);

        return (
          <Button
            asChild
            className={cn(
              "justify-start gap-2",
              isActive && "bg-muted text-foreground"
            )}
            key={item.href}
            variant="ghost"
          >
            <Link href={item.href}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
