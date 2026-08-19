
export default function DataTable({ columns, data }) {
  return (
    <div className="w-full overflow-x-auto rounded-md border border-border bg-card">
      <table className="w-full text-sm text-left">
        
        {/* Header */}
        <thead className="bg-muted text-muted-foreground border-b border-border">
          <tr>
            {columns.map((col, index) => (
              <th 
                key={index} 
                className="px-4 py-3 font-medium uppercase tracking-wider text-xs"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        
        {/* La fila */}
        <tbody className="divide-y divide-border">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="hover:bg-accent/50 transition-colors text-card-foreground"
              >
                {/* Por cada dato, busca que columna le corresponde y arma la celda */}
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    {/* Renderiza el valor, o si mandamos una función personalizada, la ejecuta */}
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={columns.length} 
                className="px-4 py-8 text-center text-muted-foreground"
              >
                No hay datos para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}