import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import ActiveQueue from './doctor/ActiveQueue.jsx';
import ConsultationPanel from './doctor/ConsultationPanel.jsx';
import Card from '../ui/Card.jsx';
import { Clipboard, RefreshCw } from 'lucide-react';
import './DoctorDashboard.css';

/**
 * Doctor Portal dashboard container and logic coordinator
 */
const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active, completed
  
  // Selected appointment for note editing
  const [selectedApp, setSelectedApp] = useState(null);
  const [notes, setNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Backend automatically applies the doctor filter based on token
      const response = await api.get('/appointments?limit=100');
      setAppointments(response.data.data);
    } catch (err) {
      console.error('Failed to load doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSelectApp = (app) => {
    setSelectedApp(app);
    setNotes(app.notes || '');
    setActionSuccess('');
    setActionError('');
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setActionSuccess('');
    setActionError('');
    setSubmitLoading(true);

    try {
      const response = await api.put(`/appointments/${selectedApp._id}`, {
        notes,
        status: 'completed'
      });

      setActionSuccess('Notes saved and consultation completed successfully.');
      setSelectedApp(response.data.data);
      fetchAppointments();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update consultation notes');
    } finally {
      setSubmitLoading(false);
    }
  };

  const activeApps = appointments.filter(
    (app) => app.status === 'scheduled' || app.status === 'arrived'
  );
  
  const completedApps = appointments.filter(
    (app) => app.status === 'completed' || app.status === 'cancelled'
  );

  return (
    <div className="doctor-dashboard">
      <div className="doctor-header-flex">
        <div>
          <h1>Clinical Practice Portal</h1>
          <p>Review scheduled patient arrivals, patient profiles, and log consultation notes.</p>
        </div>
        <button 
          className="btn btn-secondary btn-refresh" 
          onClick={fetchAppointments} 
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          Reload Queue
        </button>
      </div>

      <div className="doctor-layout-grid">
        {/* APPOINTMENTS LIST QUEUE */}
        <div className="queue-panel">
          <Card>
            <ActiveQueue
              activeApps={activeApps}
              completedApps={completedApps}
              selectedApp={selectedApp}
              onSelectApp={handleSelectApp}
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setSelectedApp(null);
              }}
              loading={loading}
            />
          </Card>
        </div>

        {/* CONSULTATION PANEL */}
        <div className="consultation-panel">
          {selectedApp ? (
            <Card>
              <ConsultationPanel
                selectedApp={selectedApp}
                notes={notes}
                setNotes={setNotes}
                onSubmit={handleSaveNotes}
                actionSuccess={actionSuccess}
                actionError={actionError}
              />
            </Card>
          ) : (
            <Card>
              <div 
                className="empty-consultation-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  textAlign: 'center', 
                  padding: '60px 40px', 
                  color: 'var(--text-muted)' 
                }}
              >
                <Clipboard size={48} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '8px', fontWeight: 600 }}>
                  No Patient Selected
                </h3>
                <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: 0, lineHeight: 1.5 }}>
                  Select a patient from the active queue on the left to review their visit purpose and edit clinical notes.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
