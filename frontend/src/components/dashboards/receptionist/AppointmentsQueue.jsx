import React from 'react';
import Badge from '../../ui/Badge.jsx';
import { Check, X } from 'lucide-react';

/**
 * Lists patients booked for today and exposes status triggers (Mark Arrived, Cancel)
 */
const AppointmentsQueue = ({ appointments = [], loading, onMarkArrived, onCancel }) => {
  return (
    <div>
      {loading ? (
        <p className="status-text" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
          Loading today's schedule...
        </p>
      ) : appointments.length === 0 ? (
        <p className="status-text" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
          No appointments booked for today yet.
        </p>
      ) : (
        <div className="today-appointments-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {appointments.map((app) => (
            <div 
              key={app._id} 
              className="today-app-item" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '12px', 
                border: '1px solid var(--border-light)', 
                borderRadius: '6px', 
                backgroundColor: '#ffffff' 
              }}
            >
              <div 
                className="app-time-badge" 
                style={{ 
                  backgroundColor: 'var(--primary-glow)', 
                  border: '1px solid var(--primary)', 
                  color: 'var(--primary)', 
                  padding: '6px 12px', 
                  borderRadius: '4px', 
                  fontFamily: 'var(--font-heading)', 
                  fontWeight: 700, 
                  fontSize: '0.95rem', 
                  minWidth: '60px', 
                  marginRight: '16px', 
                  textAlign: 'center' 
                }}
              >
                <span>{app.slot.startTime}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {app.patient?.name}
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ID: {app.patient?.patientId} | Dr. {app.doctor?.name}
                </span>
              </div>
              <div className="app-status-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Badge status={app.status} />
                
                {app.status === 'scheduled' && (
                  <div className="action-buttons-wrap" style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="action-icon-btn btn-arrive"
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '4px', 
                        border: '1px solid #bbf7d0', 
                        backgroundColor: '#dcfce7', 
                        color: '#15803d', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        transition: 'all 0.15s ease-in-out' 
                      }}
                      title="Mark Patient Arrived"
                      onClick={() => onMarkArrived(app._id)}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      className="action-icon-btn btn-cancel"
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '4px', 
                        border: '1px solid #fecaca', 
                        backgroundColor: '#fef2f2', 
                        color: '#dc2626', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        transition: 'all 0.15s ease-in-out' 
                      }}
                      title="Cancel Appointment"
                      onClick={() => onCancel(app._id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsQueue;
