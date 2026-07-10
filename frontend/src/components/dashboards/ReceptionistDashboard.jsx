import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import PatientSearch from './receptionist/PatientSearch.jsx';
import PatientRegisterForm from './receptionist/PatientRegisterForm.jsx';
import AppointmentsQueue from './receptionist/AppointmentsQueue.jsx';
import Card from '../ui/Card.jsx';
import './ReceptionistDashboard.css';

/**
 * Reception Desk panel layout and logic orchestrator
 */
const ReceptionistDashboard = () => {
  const [showRegForm, setShowRegForm] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Today's appointments state
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  const getTodayString = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const fetchTodayAppointments = async () => {
    setAppointmentsLoading(true);
    try {
      const today = getTodayString();
      const response = await api.get(`/appointments?startDate=${today}&endDate=${today}&limit=50`);
      setTodayAppointments(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const handleRegisterPatient = async (patientData) => {
    setRegError('');
    setRegSuccess('');
    setRegLoading(true);

    try {
      const response = await api.post('/appointments/patients', patientData);
      const newPatient = response.data.data;
      setRegSuccess(`Patient profile registered successfully. ID: ${newPatient.patientId}`);
      setShowRegForm(false);
      // Wait a moment, then clear success alert
      setTimeout(() => setRegSuccess(''), 5000);
    } catch (err) {
      setRegError(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setRegLoading(false);
    }
  };

  const handleMarkArrived = async (id) => {
    try {
      await api.post(`/appointments/${id}/arrive`);
      setTodayAppointments((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: 'arrived' } : app))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      setTodayAppointments((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: 'cancelled' } : app))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  return (
    <div className="receptionist-dashboard">
      <div className="receptionist-header">
        <h1>Patient Reception Desk</h1>
        <p>Process patient search lookup, register patient profiles, and manage today's appointment queue flows.</p>
      </div>

      <div className="receptionist-grid">
        {/* LEFT COLUMN: PATIENT LOOKUP & REGISTER */}
        <div className="lookup-column">
          <Card>
            {showRegForm ? (
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                  Register New Patient
                </h2>
                {regError && (
                  <div 
                    className="form-alert alert-danger" 
                    style={{ 
                      padding: '12px 16px', 
                      borderRadius: '6px', 
                      backgroundColor: '#fef2f2', 
                      border: '1px solid #fecaca', 
                      color: '#991b1b', 
                      marginBottom: '16px', 
                      fontSize: '0.875rem' 
                    }}
                  >
                    {regError}
                  </div>
                )}
                <PatientRegisterForm 
                  onSubmit={handleRegisterPatient} 
                  onCancel={() => setShowRegForm(false)} 
                  loading={regLoading}
                />
              </div>
            ) : (
              <div>
                <PatientSearch onToggleRegister={() => setShowRegForm(true)} />
                {regSuccess && (
                  <div 
                    className="form-alert alert-success" 
                    style={{ 
                      padding: '12px 16px', 
                      borderRadius: '6px', 
                      backgroundColor: '#ecfdf5', 
                      border: '1px solid #a7f3d0', 
                      color: '#065f46', 
                      marginTop: '16px', 
                      fontSize: '0.875rem' 
                    }}
                  >
                    {regSuccess}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: TODAY'S APPOINTMENTS QUEUE */}
        <div className="appointments-column">
          <Card title="Today's Appointments Queue" subtitle="Real-time patient schedule listings for today">
            <AppointmentsQueue 
              appointments={todayAppointments} 
              loading={appointmentsLoading}
              onMarkArrived={handleMarkArrived}
              onCancel={handleCancelAppointment}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
