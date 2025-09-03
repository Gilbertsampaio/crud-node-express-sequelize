// Table.jsx
import './Table.css';

export default function Table({ columns, data, emptyMessage = 'Nenhum registro encontrado.' }) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key} className={col.className || ''}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data && data.length > 0 ? (
          data.map(row => (
            <tr key={row.id}>
              {columns.map(col => (
                <td key={col.key} className={col.className || ''}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="table-empty">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={columns.length} className="table-footer">
            {data && data.length > 0 && `Total de registros: ${data.length}`}
          </td>

        </tr>
      </tfoot>
    </table>
  );
}
