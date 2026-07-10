import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import DoctorsList from './admin/DoctorsList.jsx';
import DoctorForm from './admin/DoctorForm.jsx';
import ReceptionistForm from './admin/ReceptionistForm.jsx';
import ScheduleConfigForm from './admin/ScheduleConfigForm.jsx';
import UserDirectory from './admin/UserDirectory.jsx';
import Card from '../ui/Card.jsx';
import { 
  UserPlus, 
  CalendarDays, 
  Users,
  AlertCircle,
  CheckCircle2,
  UserCog
} from 'lucide-react';
import './AdminDashboard.css';

/**
 * Super Admin Management Console tab layout and logic orchestrator
 */
const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // users, doctors, add_doctor, add_receptionist, schedule
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Status message alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data.data);
    } catch (err) {
      console.error(err);
      triggerAlert('error', 'Failed to retrieve doctors list');
    } finally {
      setDoctorsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const triggerAlert = (type, message) => {
    if (type === 'success') {
      setSuccessMsg(message);
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } else {
      setErrorMsg(message);
      setSuccessMsg('');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  const handleCreateDoctor = async (doctorData) => {
    setSubmitLoading(true);
    try {
      await api.post('/doctors', doctorData);
      triggerAlert('success', `Practitioner account for ${doctorData.name} registered successfully.`);
      fetchDoctors();
      setActiveTab('doctors');
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to create doctor account');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCreateReceptionist = async (recData) => {
    setSubmitLoading(true);
    try {
      await api.post('/doctors/receptionists', recData);
      triggerAlert('success', `Receptionist account for ${recData.name} registered successfully.`);
      setActiveTab('doctors');
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to create receptionist account');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfigureSchedule = async (scheduleData) => {
    setSubmitLoading(true);
    const { doctorId, ...payload } = scheduleData;
    try {
      await api.post(`/doctors/${doctorId}/schedule`, payload);
      triggerAlert('success', 'Doctor schedule configuration saved.');
      setActiveTab('doctors');
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to configure schedule');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h1>Administrative Console</h1>
        <p>Manage medical staff, clinic roles, practitioner scheduling, and system parameters.</p>
      </div>

      {successMsg && (
        <div className="alert alert-success animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' }}>
          <CheckCircle2 size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{errorMsg}</span>
        </div>
      )}

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <UserCog size={16} />
          User Directory
        </button>
        <button 
          className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          <Users size={16} />
          Doctors List
        </button>
        <button 
          className={`tab-btn ${activeTab === 'add_doctor' ? 'active' : ''}`}
          onClick={() => setActiveTab('add_doctor')}
        >
          <UserPlus size={16} />
          Add Doctor
        </button>
        <button 
          className={`tab-btn ${activeTab === 'add_receptionist' ? 'active' : ''}`}
          onClick={() => setActiveTab('add_receptionist')}
        >
          <UserPlus size={16} />
          Add Receptionist
        </button>
        <button 
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <CalendarDays size={16} />
          Configure Schedule
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'users' && (
          <Card title="User Directory" subtitle="System credentials and staff accounts registry">
            <UserDirectory />
          </Card>
        )}

        {activeTab === 'doctors' && (
          <Card title="Practitioner Registry" subtitle="Medical staff currently configured in the EMR database">
            <DoctorsList doctors={doctors} loading={doctorsLoading} />
          </Card>
        )}

        {activeTab === 'add_doctor' && (
          <Card title="Add Practitioner Account" subtitle="Create portal credentials and register a clinical profile">
            <DoctorForm onSubmit={handleCreateDoctor} loading={submitLoading} />
          </Card>
        )}

        {activeTab === 'add_receptionist' && (
          <Card title="Add Receptionist Account" subtitle="Create receptionist staff portal credentials">
            <ReceptionistForm onSubmit={handleCreateReceptionist} loading={submitLoading} />
          </Card>
        )}

        {activeTab === 'schedule' && (
          <Card title="Configure Practitioner Schedule" subtitle="Define working hours, appointment slots, daily sessions, and breaks">
            <ScheduleConfigForm doctors={doctors} onSubmit={handleConfigureSchedule} loading={submitLoading} />
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
