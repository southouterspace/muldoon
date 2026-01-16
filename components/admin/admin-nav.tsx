"use client";

import { Package, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  {
    label: "Players",
    href: "/admin/players",
    icon: Users,
  },
] as const;

export function AdminNav(): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col items-center gap-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin" || pathname.startsWith("/admin/items")
            : pathname.startsWith(item.href);

        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Button
                asChild
                className={cn(
                  "size-12 p-0",
                  isActive && "bg-muted text-foreground"
                )}
                size="lg"
                variant="ghost"
              >
                <Link href={item.href}>
                  <Icon className="size-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
