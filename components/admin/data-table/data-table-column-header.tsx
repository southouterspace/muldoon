"use client";

import type { Column, SortDirection } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

function SortIcon({
  direction,
}: {
  direction: false | SortDirection;
}): React.ReactNode {
  if (direction === "desc") {
    return <ArrowDownIcon className="ml-2 size-4" />;
  }
  if (direction === "asc") {
    return <ArrowUpIcon className="ml-2 size-4" />;
  }
  return <ArrowUpDownIcon className="ml-2 size-4" />;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>): React.ReactNode {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <Button
      className="-ml-3 h-8"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      size="sm"
      variant="ghost"
    >
      {title}
      <SortIcon direction={column.getIsSorted()} />
    </Button>
  );
}
