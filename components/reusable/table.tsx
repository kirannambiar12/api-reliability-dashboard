import type { ReactNode } from "react";

export interface TableCellContext<T> {
  row: T;
  rowIndex: number;
  rowBusy: boolean;
}

export interface TableColumn<T> {
  id: string;
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (ctx: TableCellContext<T>) => ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (row: T, rowIndex: number) => string;
  isRowBusy?: (row: T) => boolean;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  getRowKey,
  isRowBusy,
  className = "",
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`.trim()}>
      <table className="min-w-full table-fixed text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
            {columns.map((col) => (
              <th
                key={col.id}
                className={`px-4 py-3 font-semibold ${col.headerClassName ?? ""}`.trim()}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const rowBusy = isRowBusy?.(row) ?? false;
            const key = getRowKey(row, rowIndex);
            return (
              <tr key={key} className="border-b border-zinc-100 align-middle">
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`px-4 py-4 ${col.cellClassName ?? ""}`.trim()}
                  >
                    {col.render({ row, rowIndex, rowBusy })}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
