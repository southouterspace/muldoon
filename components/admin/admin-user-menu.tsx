"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminUserMenuProps {
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

export function AdminUserMenu({
  email,
}: AdminUserMenuProps): React.ReactElement {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          type="button"
        >
          <Avatar className="size-10 cursor-pointer border-2 border-border">
            <AvatarImage alt={email} />
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
              {getInitials(email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" side="right">
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
  );
}
