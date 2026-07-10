import React from 'react';
import Table from '../../ui/Table.jsx';

/**
 * Renders the doctors table on the administrative dashboard
 */
const DoctorsList = ({ doctors, loading }) => {
  const headers = [
    'Doctor Name',
    'Email Address',
    'Department',
    'Specialization',
    'Contact Number',
    'Status'
  ];

  return (
    <Table 
      headers={headers} 
      loading={loading} 
      emptyMessage="No doctors registered in the system yet."
    >
      {doctors.map((doc) => (
        <tr key={doc._id}>
          <td className="doc-table-name" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            {doc.name}
          </td>
          <td>{doc.user?.email || 'N/A'}</td>
          <td>
            <span 
              className="badge-dept" 
              style={{ 
                backgroundColor: '#f1f5f9', 
                border: '1px solid var(--border-light)', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}
            >
              {doc.department}
            </span>
          </td>
          <td>{doc.specialization}</td>
          <td>{doc.contactNumber}</td>
          <td>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span
                className="status-dot"
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: doc.user?.isActive ? 'var(--success)' : 'var(--text-muted)'
                }}
              ></span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {doc.user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
};

export default DoctorsList;
