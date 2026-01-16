"use client";

import { Menu, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileNavProps {
  isAdmin: boolean;
  cartItemCount: number;
}

export function MobileNav({
  isAdmin,
  cartItemCount,
}: MobileNavProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 md:hidden">
      {/* Cart button - always visible on mobile */}
      <Button asChild size="icon" variant="ghost">
        <Link href="/cart">
          <ShoppingCart className="size-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground">
              {cartItemCount > 99 ? "99+" : cartItemCount}
            </span>
          )}
          <span className="sr-only">Cart ({cartItemCount} items)</span>
        </Link>
      </Button>

      {/* Hamburger menu trigger */}
      <Button
        aria-label="Open navigation menu"
        onClick={() => setOpen(true)}
        size="icon"
        variant="ghost"
      >
        <Menu className="size-5" />
      </Button>

      {/* Slide-out navigation sheet */}
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetContent className="flex flex-col" side="right">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-bold text-xl tracking-tight">
                Menu
              </SheetTitle>
              <SheetClose asChild>
                <Button
                  aria-label="Close navigation menu"
                  size="icon-sm"
                  variant="ghost"
                >
                  <X className="size-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>

          <nav className="flex flex-1 flex-col gap-1 py-4">
            {/* Main navigation links */}
            <SheetClose asChild>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                href="/"
              >
                <span className="flex size-8 items-center justify-center rounded-md bg-muted">
                  🏠
                </span>
                Shop
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                href="/cart"
              >
                <span className="flex size-8 items-center justify-center rounded-md bg-muted">
                  <ShoppingCart className="size-4" />
                </span>
                Cart
                {cartItemCount > 0 && (
                  <span className="ml-auto rounded-full bg-primary px-2 py-0.5 font-semibold text-primary-foreground text-xs">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </SheetClose>

            {isAdmin && (
              <>
                <div className="my-3 h-px bg-border" />
                <p className="mb-1 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Admin
                </p>
                <SheetClose asChild>
                  <Link
                    className="flex items-center gap-3 rounded-lg px-3 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                    href="/admin"
                  >
                    <span className="flex size-8 items-center justify-center rounded-md bg-secondary">
                      ⚙️
                    </span>
                    Dashboard
                  </Link>
                </SheetClose>
              </>
            )}
          </nav>

          {/* Footer area */}
          <div className="mt-auto border-t pt-4">
            <p className="text-center text-muted-foreground text-xs">
              Raptors Spring 2026
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
