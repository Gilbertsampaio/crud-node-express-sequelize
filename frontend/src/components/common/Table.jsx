// Table.jsx
import { useState, useMemo } from 'react';
import './Table.css';

export default function Table({ columns, data, emptyMessage }) {
  const [searchText, setSearchText] = useState('');

  // Filtra os dados de acordo com o texto de pesquisa
  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter(row =>
      columns.some(col => {
        const value = col.render ? col.render(row) : row[col.key];
        return value?.toString().toLowerCase().includes(searchText.toLowerCase());
      })
    );
  }, [data, searchText, columns]);

  return (
    <div className="table-wrapper">
      {/* Campo de pesquisa */}
      <input
        type="text"
        placeholder="Pesquisar..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        className="table-search"
      />

      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={col.className || ''}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData && filteredData.length > 0 ? (
            filteredData.map(row => (
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
              {filteredData && filteredData.length > 0 && `Total de registros: ${filteredData.length}`}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
