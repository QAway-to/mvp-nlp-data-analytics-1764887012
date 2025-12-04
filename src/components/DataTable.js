export default function DataTable({ data }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <p style={{ color: '#94a3b8' }}>Нет данных для отображения</p>;
  }

  const columns = Object.keys(data[0] || {});

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #334155' }}>
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  color: '#94a3b8',
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'uppercase'
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              style={{
                borderBottom: '1px solid #1e293b',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1e293b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {columns.map((col) => (
                <td
                  key={col}
                  style={{
                    padding: '12px',
                    fontSize: 14
                  }}
                >
                  {String(row[col] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

