import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { 
  Clipboard, 
  User, 
  Calendar, 
  Save, 
  FileText,
  Clock,
  RefreshCw
} from 'lucide-react';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active, completed
  
  // Selected appointment for note editing
  const [selectedApp, setSelectedApp] = useState(null);
  const [notes, setNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

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

    try {
      // Save notes and mark as completed
      const response = await api.put(`/appointments/${selectedApp._id}`, {
        notes,
        status: 'completed'
      });

      setActionSuccess('Notes saved and consultation completed successfully!');
      setSelectedApp(response.data.data);
      
      // Refresh list
      fetchAppointments();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update consultation notes');
    }
  };

  // Filter appointments
  // Active: scheduled, arrived
  // Completed: completed, cancelled
  const activeApps = appointments.filter(
    (app) => app.status === 'scheduled' || app.status === 'arrived'
  );
  
  const completedApps = appointments.filter(
    (app) => app.status === 'completed' || app.status === 'cancelled'
  );

  const displayedApps = activeTab === 'active' ? activeApps : completedApps;

  const calculateAge = (dobString) => {
    if (!dobString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="doctor-dashboard">
      <div className="doctor-header-flex">
        <div>
          <h1>Clinical Practice Portal</h1>
          <p>Review scheduled patient arrivals, patient profiles, and update consultation notes.</p>
        </div>
        <button className="btn btn-secondary btn-refresh" onClick={fetchAppointments} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
          Reload Queue
        </button>
      </div>

      <div className="doctor-layout-grid">
        
        {/* APPOINTMENTS LIST CONTAINER */}
        <div className="queue-panel">
          <div className="glass-card list-card">
            
            <div className="tab-filters">
              <button
                className={`tab-filter-btn ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('active');
                  setSelectedApp(null);
                }}
              >
                Active Patients ({activeApps.length})
              </button>
              <button
                className={`tab-filter-btn ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('completed');
                  setSelectedApp(null);
                }}
              >
                History ({completedApps.length})
              </button>
            </div>

            {loading ? (
              <p className="status-text">Retrieving patient queue...</p>
            ) : displayedApps.length === 0 ? (
              <p className="status-text">No patients in this queue.</p>
            ) : (
              <div className="queue-list">
                {displayedApps.map((app) => {
                  const isSelected = selectedApp?._id === app._id;
                  return (
                    <div
                      key={app._id}
                      className={`queue-item glass-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectApp(app)}
                    >
                      <div className="queue-time-wrap">
                        <Clock size={16} />
                        <span>{app.slot.startTime}</span>
                      </div>
                      <div className="queue-patient-details">
                        <h3>{app.patient?.name}</h3>
                        <span>ID: {app.patient?.patientId} | DOB: {new Date(app.patient?.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                      <span className={`badge badge-${app.status}`}>
                        {app.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* CONSULTATION PANEL */}
        <div className="consultation-panel">
          {selectedApp ? (
            <div className="glass-card consultation-card animate-fade-in">
              <div className="consultation-header">
                <h2>Clinical Consultation</h2>
                <span className={`badge badge-${selectedApp.status}`}>
                  {selectedApp.status}
                </span>
              </div>

              {/* Patient Profile Box */}
              <div className="patient-profile-box">
                <div className="patient-icon-wrap">
                  <User size={24} />
                </div>
                <div className="profile-details-grid">
                  <div>
                    <label>Patient Name</label>
                    <p>{selectedApp.patient?.name}</p>
                  </div>
                  <div>
                    <label>Patient ID</label>
                    <p className="patient-id-num">{selectedApp.patient?.patientId}</p>
                  </div>
                  <div>
                    <label>Age / Gender</label>
                    <p>{calculateAge(selectedApp.patient?.dateOfBirth)} Yrs / {selectedApp.patient?.gender}</p>
                  </div>
                  <div>
                    <label>Mobile Number</label>
                    <p>{selectedApp.patient?.mobileNumber}</p>
                  </div>
                </div>
              </div>

              <div className="appointment-purpose-box">
                <label><Clipboard size={14} /> Purpose of Visit</label>
                <p>{selectedApp.purpose}</p>
              </div>

              {/* Notes form */}
              <form onSubmit={handleSaveNotes} className="notes-form">
                
                {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}
                {actionError && <div className="alert alert-danger">{actionError}</div>}

                <div className="form-group">
                  <label className="form-label notes-label">
                    <FileText size={16} />
                    Consultation & Prescription Notes
                  </label>
                  <textarea
                    className="form-textarea notes-textarea"
                    rows="10"
                    placeholder="Enter clinical symptoms, diagnosis, and prescription details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={selectedApp.status === 'completed' || selectedApp.status === 'cancelled'}
                    required
                  ></textarea>
                </div>

                {selectedApp.status !== 'completed' && selectedApp.status !== 'cancelled' && (
                  <button type="submit" className="btn btn-primary save-notes-btn">
                    <Save size={16} />
                    Complete & Save Consultation
                  </button>
                )}
              </form>

            </div>
          ) : (
            <div className="glass-card empty-consultation-card">
              <Clipboard size={48} className="empty-icon" />
              <h3>No Patient Selected</h3>
              <p>Select a patient from the active list on the left to begin consultation and enter clinical notes.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
