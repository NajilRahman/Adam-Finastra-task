import React from 'react';
import { Clock } from 'lucide-react';
import Badge from '../../ui/Badge.jsx';

/**
 * Doctor queue sidebar listing patients based on active tab filtering
 */
const ActiveQueue = ({
  activeApps = [],
  completedApps = [],
  selectedApp,
  onSelectApp,
  activeTab,
  setActiveTab,
  loading
}) => {
  const displayedApps = activeTab === 'active' ? activeApps : completedApps;

  return (
    <div className="queue-panel">
      <div 
        className="tab-filters" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '8px', 
          marginBottom: '20px', 
          borderBottom: '1px solid var(--border-light)', 
          paddingBottom: '14px' 
        }}
      >
        <button
          className={`tab-filter-btn ${activeTab === 'active' ? 'active' : ''}`}
          style={{
            background: activeTab === 'active' ? 'var(--primary-glow)' : 'transparent',
            border: activeTab === 'active' ? '1px solid var(--primary)' : '1px solid transparent',
            color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-secondary)',
            padding: '8px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: '0.85rem',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onClick={() => setActiveTab('active')}
        >
          Active Patients ({activeApps.length})
        </button>
        <button
          className={`tab-filter-btn ${activeTab === 'completed' ? 'active' : ''}`}
          style={{
            background: activeTab === 'completed' ? 'var(--primary-glow)' : 'transparent',
            border: activeTab === 'completed' ? '1px solid var(--primary)' : '1px solid transparent',
            color: activeTab === 'completed' ? 'var(--primary)' : 'var(--text-secondary)',
            padding: '8px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: '0.85rem',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onClick={() => setActiveTab('completed')}
        >
          History ({completedApps.length})
        </button>
      </div>

      {loading ? (
        <p className="status-text" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px 0' }}>
          Retrieving patient queue...
        </p>
      ) : displayedApps.length === 0 ? (
        <p className="status-text" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px 0' }}>
          No patients in this queue.
        </p>
      ) : (
        <div 
          className="queue-list" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            maxHeight: 'calc(100vh - 280px)', 
            overflowY: 'auto' 
          }}
        >
          {displayedApps.map((app) => {
            const isSelected = selectedApp?._id === app._id;
            return (
              <div
                key={app._id}
                className={`queue-item ${isSelected ? 'selected' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? 'var(--primary-glow)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => onSelectApp(app)}
              >
                <div 
                  className="queue-time-wrap" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    color: 'var(--primary)', 
                    fontFamily: 'var(--font-heading)', 
                    fontWeight: 700, 
                    fontSize: '1rem', 
                    marginRight: '12px', 
                    minWidth: '55px' 
                  }}
                >
                  <Clock size={14} />
                  <span>{app.slot.startTime}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {app.patient?.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ID: {app.patient?.patientId}
                  </span>
                </div>
                <Badge status={app.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveQueue;
