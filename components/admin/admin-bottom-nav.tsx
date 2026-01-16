"use client";

import { LogOut, Package, ShoppingBag, Store, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Store",
    href: "/",
    icon: Store,
    isExternal: true,
  },
  {
    label: "Items",
    href: "/admin",
    icon: Package,
    isExternal: false,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    isExternal: false,
  },
  {
    label: "Players",
    href: "/admin/players",
    icon: Users,
    isExternal: false,
  },
] as const;

interface AdminBottomNavProps {
  email: string;
}

const NAME_SEPARATOR_REGEX = /[._-]/;

function getInitials(email: string): string {
  const name = email.split("@")[0];
  if (!name) {
    return "?";
  }
  const parts = name.split(NAME_SEPARATOR_REGEX);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function isNavItemActive(
  item: (typeof navItems)[number],
  pathname: string
): boolean {
  if (item.isExternal) {
    return false;
  }
  if (item.href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/items");
  }
  return pathname.startsWith(item.href);
}

export function AdminBottomNav({
  email,
}: AdminBottomNavProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav className="safe-b fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pb-safe backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(item, pathname);

          return (
            <Link
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-muted-foreground transition-colors",
                isActive && "text-foreground"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon
                className={cn(
                  "size-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span className="font-medium text-[10px] tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2 outline-none"
              type="button"
            >
              <Avatar className="size-6 border border-border">
                <AvatarImage alt={email} />
                <AvatarFallback className="bg-primary/10 font-semibold text-[10px] text-primary">
                  {getInitials(email)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-[10px] text-muted-foreground tracking-tight">
                Account
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" side="top">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm">{email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form action="/auth/logout" method="POST">
              <DropdownMenuItem asChild variant="destructive">
                <button className="w-full cursor-pointer" type="submit">
                  <LogOut className="mr-2 size-4" />
                  Log out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
