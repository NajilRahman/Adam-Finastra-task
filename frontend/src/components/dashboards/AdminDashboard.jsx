import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { 
  UserPlus, 
  CalendarDays, 
  Plus, 
  Trash, 
  Clock, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('doctors'); // doctors, add_doctor, add_receptionist, schedule
  
  // Status message alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Doctor Form State
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docPassword, setDocPassword] = useState('');
  const [docDept, setDocDept] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docContact, setDocContact] = useState('');

  // Receptionist Form State
  const [recName, setRecName] = useState('');
  const [recEmail, setRecEmail] = useState('');
  const [recPassword, setRecPassword] = useState('');

  // Schedule Form State
  const [schedDoctorId, setSchedDoctorId] = useState('');
  const [schedDays, setSchedDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri default
  const [schedDuration, setSchedDuration] = useState(15);
  
  // Sessions arrays
  const [sessions, setSessions] = useState([
    { name: 'Morning Session', startTime: '09:00', endTime: '12:00' },
    { name: 'Evening Session', startTime: '13:00', endTime: '17:00' }
  ]);
  // Breaks array
  const [breaks, setBreaks] = useState([
    { name: 'Lunch Break', startTime: '12:00', endTime: '13:00' }
  ]);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data.data);
      if (response.data.data.length > 0 && !schedDoctorId) {
        setSchedDoctorId(response.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
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

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/doctors', {
        name: docName,
        email: docEmail,
        password: docPassword,
        department: docDept,
        specialization: docSpecialty,
        contactNumber: docContact
      });
      triggerAlert('success', `Doctor account for ${docName} created successfully!`);
      // Reset form
      setDocName('');
      setDocEmail('');
      setDocPassword('');
      setDocDept('');
      setDocSpecialty('');
      setDocContact('');
      fetchDoctors();
      setActiveTab('doctors');
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to create doctor account');
    }
  };

  const handleCreateReceptionist = async (e) => {
    e.preventDefault();
    try {
      await api.post('/doctors/receptionists', {
        name: recName,
        email: recEmail,
        password: recPassword
      });
      triggerAlert('success', `Receptionist account for ${recName} created successfully!`);
      setRecName('');
      setRecEmail('');
      setRecPassword('');
      setActiveTab('doctors');
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to create receptionist account');
    }
  };

  const handleDayToggle = (day) => {
    if (schedDays.includes(day)) {
      setSchedDays(schedDays.filter((d) => d !== day));
    } else {
      setSchedDays([...schedDays, day]);
    }
  };

  const handleAddSession = () => {
    setSessions([...sessions, { name: `Session ${sessions.length + 1}`, startTime: '09:00', endTime: '17:00' }]);
  };

  const handleRemoveSession = (index) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const handleSessionChange = (index, field, value) => {
    const updated = sessions.map((s, i) => {
      if (i === index) {
        return { ...s, [field]: value };
      }
      return s;
    });
    setSessions(updated);
  };

  const handleAddBreak = () => {
    setBreaks([...breaks, { name: 'Break', startTime: '12:00', endTime: '13:00' }]);
  };

  const handleRemoveBreak = (index) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };

  const handleBreakChange = (index, field, value) => {
    const updated = breaks.map((b, i) => {
      if (i === index) {
        return { ...b, [field]: value };
      }
      return b;
    });
    setBreaks(updated);
  };

  const handleConfigureSchedule = async (e) => {
    e.preventDefault();
    if (!schedDoctorId) {
      triggerAlert('error', 'Please select a doctor');
      return;
    }
    if (schedDays.length === 0) {
      triggerAlert('error', 'Select at least one working day');
      return;
    }
    if (sessions.length === 0) {
      triggerAlert('error', 'Configure at least one working session');
      return;
    }

    try {
      await api.post(`/doctors/${schedDoctorId}/schedule`, {
        workingDays: schedDays,
        slotDuration: Number(schedDuration),
        sessions,
        breakTimings: breaks
      });
      triggerAlert('success', 'Doctor schedule configured successfully!');
      setActiveTab('doctors');
    } catch (err) {
      triggerAlert('error', err.response?.data?.message || 'Failed to configure schedule');
    }
  };

  const weekdays = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 }
  ];

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h1>Administrative Command Console</h1>
        <p>Manage medical staff, roles, scheduling, and portal access parameters.</p>
      </div>

      {successMsg && (
        <div className="alert alert-success animate-fade-in">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger animate-fade-in">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
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
        {/* DOCTORS LIST TAB */}
        {activeTab === 'doctors' && (
          <div className="glass-card table-card animate-fade-in">
            <h2>Configured Clinic Staff</h2>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Email Address</th>
                    <th>Department</th>
                    <th>Specialization</th>
                    <th>Contact Number</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                        No doctors registered in the system yet.
                      </td>
                    </tr>
                  ) : (
                    doctors.map((doc) => (
                      <tr key={doc._id}>
                        <td className="doc-table-name">{doc.name}</td>
                        <td>{doc.user?.email || 'N/A'}</td>
                        <td><span className="badge-dept">{doc.department}</span></td>
                        <td>{doc.specialization}</td>
                        <td>{doc.contactNumber}</td>
                        <td>
                          <span className={`status-dot ${doc.user?.isActive ? 'active' : 'inactive'}`}></span>
                          {doc.user?.isActive ? 'Active' : 'Inactive'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADD DOCTOR TAB */}
        {activeTab === 'add_doctor' && (
          <div className="glass-card form-card animate-fade-in">
            <h2>Register Doctor Profile</h2>
            <form onSubmit={handleCreateDoctor}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. Sarah Jenkins"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address (Login ID)</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. sjenkins@aura.com"
                    value={docEmail}
                    onChange={(e) => setDocEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Portal Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={docPassword}
                    onChange={(e) => setDocPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Medical Department</label>
                  <select
                    className="form-select"
                    value={docDept}
                    onChange={(e) => setDocDept(e.target.value)}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Specialization Details</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Pediatric Pulmonology"
                    value={docSpecialty}
                    onChange={(e) => setDocSpecialty(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact / Mobile Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="10-digit number"
                    value={docContact}
                    onChange={(e) => setDocContact(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                Create Account & Profile
              </button>
            </form>
          </div>
        )}

        {/* ADD RECEPTIONIST TAB */}
        {activeTab === 'add_receptionist' && (
          <div className="glass-card form-card animate-fade-in" style={{ maxWidth: '600px' }}>
            <h2>Register Receptionist Account</h2>
            <form onSubmit={handleCreateReceptionist}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Liam Porter"
                  value={recName}
                  onChange={(e) => setRecName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address (Login ID)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. lporter@aura.com"
                  value={recEmail}
                  onChange={(e) => setRecEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Portal Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={recPassword}
                  onChange={(e) => setRecPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Create Staff Account
              </button>
            </form>
          </div>
        )}

        {/* CONFIGURE SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div className="glass-card form-card schedule-config-card animate-fade-in">
            <h2>Manage Doctor Schedules</h2>
            <form onSubmit={handleConfigureSchedule}>
              
              <div className="form-group" style={{ maxWidth: '400px' }}>
                <label className="form-label">Select Practitioner</label>
                <select
                  className="form-select"
                  value={schedDoctorId}
                  onChange={(e) => setSchedDoctorId(e.target.value)}
                  required
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Working Days Selector */}
              <div className="form-group">
                <label className="form-label">Practicing Days</label>
                <div className="days-checkbox-grid">
                  {weekdays.map((day) => {
                    const isChecked = schedDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        className={`day-selector-btn ${isChecked ? 'selected' : ''}`}
                        onClick={() => handleDayToggle(day.value)}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration and Timing Variables */}
              <div className="form-group" style={{ maxWidth: '250px' }}>
                <label className="form-label">Appointment Duration (Minutes)</label>
                <select
                  className="form-select"
                  value={schedDuration}
                  onChange={(e) => setSchedDuration(e.target.value)}
                >
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes (Default)</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div className="schedule-timings-section">
                
                {/* SESSIONS SETUP */}
                <div className="timings-column glass-card">
                  <div className="timing-header">
                    <h3>Active Daily Sessions</h3>
                    <button type="button" className="btn-add-timing" onClick={handleAddSession}>
                      <Plus size={16} /> Add Session
                    </button>
                  </div>
                  
                  {sessions.map((session, index) => (
                    <div key={index} className="timing-row">
                      <div className="form-group row-flex">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Session Name"
                          value={session.name}
                          onChange={(e) => handleSessionChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group row-flex time-inputs">
                        <div className="time-input-wrap">
                          <Clock size={14} />
                          <input
                            type="text"
                            className="form-input text-center"
                            placeholder="HH:MM"
                            value={session.startTime}
                            onChange={(e) => handleSessionChange(index, 'startTime', e.target.value)}
                            required
                          />
                        </div>
                        <span>to</span>
                        <div className="time-input-wrap">
                          <Clock size={14} />
                          <input
                            type="text"
                            className="form-input text-center"
                            placeholder="HH:MM"
                            value={session.endTime}
                            onChange={(e) => handleSessionChange(index, 'endTime', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      {sessions.length > 1 && (
                        <button type="button" className="btn-delete-row" onClick={() => handleRemoveSession(index)}>
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* BREAKS SETUP */}
                <div className="timings-column glass-card">
                  <div className="timing-header">
                    <h3>Break Allocations</h3>
                    <button type="button" className="btn-add-timing" onClick={handleAddBreak}>
                      <Plus size={16} /> Add Break
                    </button>
                  </div>
                  
                  {breaks.length === 0 ? (
                    <p className="no-timings-placeholder">No break allocations configured.</p>
                  ) : (
                    breaks.map((brk, index) => (
                      <div key={index} className="timing-row">
                        <div className="form-group row-flex">
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Break Name"
                            value={brk.name}
                            onChange={(e) => handleBreakChange(index, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group row-flex time-inputs">
                          <div className="time-input-wrap">
                            <Clock size={14} />
                            <input
                              type="text"
                              className="form-input text-center"
                              placeholder="HH:MM"
                              value={brk.startTime}
                              onChange={(e) => handleBreakChange(index, 'startTime', e.target.value)}
                              required
                            />
                          </div>
                          <span>to</span>
                          <div className="time-input-wrap">
                            <Clock size={14} />
                            <input
                              type="text"
                              className="form-input text-center"
                              placeholder="HH:MM"
                              value={brk.endTime}
                              onChange={(e) => handleBreakChange(index, 'endTime', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <button type="button" className="btn-delete-row" onClick={() => handleRemoveBreak(index)}>
                          <Trash size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ marginTop: '30px' }}>
                <button type="submit" className="btn btn-primary">
                  Save Schedule Configuration
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
