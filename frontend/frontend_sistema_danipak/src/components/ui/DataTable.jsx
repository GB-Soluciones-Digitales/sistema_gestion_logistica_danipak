import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function DataTable({ columns, data }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !data) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
      key = null;
    }
    
    setSortConfig({ key, direction });
  };

  return (
    <div className="w-full overflow-x-auto rounded-md border border-border bg-card">
      <table className="w-full text-sm text-left">
        
        {/* Header */}
        <thead className="bg-muted text-muted-foreground border-b border-border">
          <tr>
            {columns.map((col, index) => (
              <th key={index} onClick={() => col.key !== 'acciones' && handleSort(col.key)} className={`px-4 py-3 font-medium uppercase tracking-wider text-xs ${
                  col.key !== 'acciones' ? 'cursor-pointer hover:bg-accent/50 transition-colors select-none' : '' }`}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {col.key !== 'acciones' && (
                    <span className="text-muted-foreground/70">
                      {sortConfig.key === col.key ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp size={14} className="text-primary" />
                        ) : (
                          <ArrowDown size={14} className="text-primary" />
                        )
                      ) : (
                        <ArrowUpDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        {/* La fila */}
        <tbody className="divide-y divide-border">
          {sortedData && sortedData.length > 0 ? (
            sortedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-accent/50 transition-colors text-card-foreground">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                No hay datos para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}