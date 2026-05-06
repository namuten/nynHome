import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function AdminTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  emptyMessage = '등록된 데이터가 없습니다.',
}: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full bg-white rounded-3xl border border-surface-container overflow-hidden shadow-sm animate-pulse">
        <div className="h-14 bg-surface-container-low border-b border-surface-container" />
        <div className="p-6 space-y-4">
          <div className="h-10 bg-surface-container/50 rounded-xl" />
          <div className="h-10 bg-surface-container/50 rounded-xl" />
          <div className="h-10 bg-surface-container/50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white p-12 text-center rounded-3xl border border-surface-container shadow-sm space-y-3 font-body">
        <div className="text-4xl">📭</div>
        <p className="text-sm font-semibold text-on-surface-variant">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl border border-surface-container overflow-hidden shadow-sm font-body">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/30 border-b border-surface-container select-none">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container/50">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-surface-container/10 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`p-4 text-xs font-medium text-on-surface align-middle ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
