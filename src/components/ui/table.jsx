function Table({ columns, rows, emptyLabel = "Belum ada data" }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2 text-left font-semibold text-slate-600">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-slate-500" colSpan={columns.length}>
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2 align-top text-slate-700">
                    {typeof column.render === "function" ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
