"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";

function RowWrapper({
  children,
  contextMenu,
}: {
  children: React.ReactNode;
  contextMenu?: React.ReactNode;
}): React.ReactNode {
  if (!contextMenu) {
    return children;
  }
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>{contextMenu}</ContextMenuContent>
    </ContextMenu>
  );
}

const DEFAULT_PAGE_SIZE = 10;
const MIN_PAGE_SIZE = 10;

function getSortStorageKey(tableId: string): string {
  return `table-sort-${tableId}`;
}

function getPageSizeStorageKey(tableId: string): string {
  return `table-pagesize-${tableId}`;
}

function loadSortingState(tableId: string): SortingState {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const stored = localStorage.getItem(getSortStorageKey(tableId));
    if (stored) {
      return JSON.parse(stored) as SortingState;
    }
  } catch {
    // Invalid JSON, return default
  }
  return [];
}

function saveSortingState(tableId: string, sorting: SortingState): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(getSortStorageKey(tableId), JSON.stringify(sorting));
  } catch {
    // localStorage not available
  }
}

function loadPageSize(tableId: string): number {
  if (typeof window === "undefined") {
    return DEFAULT_PAGE_SIZE;
  }
  try {
    const stored = localStorage.getItem(getPageSizeStorageKey(tableId));
    if (stored) {
      const size = Number(stored);
      if (size >= MIN_PAGE_SIZE) {
        return size;
      }
    }
  } catch {
    // Invalid value, return default
  }
  return DEFAULT_PAGE_SIZE;
}

function savePageSize(tableId: string, pageSize: number): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(getPageSizeStorageKey(tableId), String(pageSize));
  } catch {
    // localStorage not available
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableId: string;
  filterColumn?: string;
  filterPlaceholder?: string;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  toolbar?: React.ReactNode;
  renderRowContextMenu?: (row: TData) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  tableId,
  filterColumn,
  filterPlaceholder = "Filter...",
  rowSelection,
  onRowSelectionChange,
  toolbar,
  renderRowContextMenu,
}: DataTableProps<TData, TValue>): React.ReactNode {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Load sorting and page size state from localStorage on mount
  useEffect(() => {
    setSorting(loadSortingState(tableId));
    setPageSize(loadPageSize(tableId));
  }, [tableId]);

  // Persist sorting state to localStorage
  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updaterOrValue) => {
      setSorting((prev) => {
        const next =
          typeof updaterOrValue === "function"
            ? updaterOrValue(prev)
            : updaterOrValue;
        saveSortingState(tableId, next);
        return next;
      });
    },
    [tableId]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex: 0, pageSize })
          : updater;
      if (newState.pageSize !== pageSize) {
        setPageSize(newState.pageSize);
        savePageSize(tableId, newState.pageSize);
      }
    },
    state: {
      sorting,
      columnFilters,
      rowSelection: rowSelection ?? {},
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {filterColumn ? (
          <Input
            className="max-w-sm"
            onChange={(e) =>
              table.getColumn(filterColumn)?.setFilterValue(e.target.value)
            }
            placeholder={filterPlaceholder}
            value={
              (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
            }
          />
        ) : (
          <div />
        )}
        {toolbar}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <RowWrapper
                  contextMenu={renderRowContextMenu?.(row.original)}
                  key={row.id}
                >
                  <TableRow
                    data-state={row.getIsSelected() ? "selected" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </RowWrapper>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
