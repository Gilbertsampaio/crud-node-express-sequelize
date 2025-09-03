import './Table.css';

// Table.jsx
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
            <td colSpan={columns.length} className="table-empty" style={{ textAlign: 'center', padding: '15px', fontSize: '14px' }}>
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
