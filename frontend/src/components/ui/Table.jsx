import React from 'react';

/**
 * Reusable table component with sticky headers, loading skeletons, and empty state support
 */
const Table = ({
  headers = [],
  children,
  loading = false,
  emptyMessage = 'No records found.',
  className = '',
  ...props
}) => {
  return (
    <div className={`table-wrapper ${className}`.trim()} {...props}>
      <table className="admin-table">
        <thead>
          <tr>
            {headers.map((header, i) => {
              const isSortable = typeof header === 'object' && header.sortable;
              const label = typeof header === 'object' ? header.label : header;
              const onClick = typeof header === 'object' ? header.onClick : undefined;
              return (
                <th
                  key={i}
                  onClick={onClick}
                  className={isSortable ? 'sortable-col' : ''}
                  style={isSortable ? { cursor: 'pointer', userSelect: 'none' } : undefined}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {label}
                    {isSortable && typeof header.icon === 'function' && header.icon()}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s ease-in-out' }}>
          {React.Children.count(children) === 0 ? (
            loading ? (
              <tr>
                <td colSpan={headers.length} style={{ textAlign: 'center', padding: '32px' }}>
                  <div 
                    className="table-skeleton" 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px',
                      width: '100%'
                    }}
                  >
                    <div style={{ height: '18px', backgroundColor: '#f1f5f9', borderRadius: '4px', width: '100%' }}></div>
                    <div style={{ height: '18px', backgroundColor: '#f1f5f9', borderRadius: '4px', width: '85%' }}></div>
                    <div style={{ height: '18px', backgroundColor: '#f1f5f9', borderRadius: '4px', width: '90%' }}></div>
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={headers.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  {emptyMessage}
                </td>
              </tr>
            )
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
