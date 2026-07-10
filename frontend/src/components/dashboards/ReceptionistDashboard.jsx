import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import { 
  Search, 
  UserPlus, 
  Calendar, 
  Check, 
  X,
  Phone,
  User,
  AlertCircle
} from 'lucide-react';
import './ReceptionistDashboard.css';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();

  // Search Patient states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // New Patient Form states
  const [showRegForm, setShowRegForm] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientMobile, setPatientMobile] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientDob, setPatientDob] = useState('');
  const [patientGender, setPatientGender] = useState('male');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

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

  const handlePatientSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setHasSearched(true);
    try {
      // Find patients matching search query (we can search by name/mobile/id)
      // We will hit a patient search helper or standard query.
      // Wait, we don't have a direct GET /patients endpoint listed in prompt, but we can query appointments or build a quick patient search endpoint!
      // Wait! Let's check how the receptionist searches patients.
      // Receptionist can search by Patient ID, Mobile Number, or Name.
      // Let's implement patient search. We can do a quick search in Appointments or query a route.
      // Wait, to do patient search, did we define a Route for patients?
      // No, the required routes are: Auth, Doctors, Slots, Appointments.
      // Can we add a patients search route? Yes! "Additional endpoints may be added if required."
      // Wait! Let's check if we can query patients in our backend. Yes, we can add a route: `GET /api/v1/appointments` which accepts `patientSearch` or `mobileSearch`.
      // Alternatively, we can add `GET /api/v1/appointments` search or implement a quick `/api/v1/appointments` filter.
      // Wait, if we want to search patients directly, let's look up how we can find patients. We can search patients by mobile or name.
      // Let's see: we can define a quick endpoint in `appointment.routes.js` or a new endpoint `GET /api/v1/appointments` which retrieves patient records!
      // Wait, let's check if we should add `GET /api/v1/appointments` search, or let's create a dedicated route for Patient Search in `backend/routes/appointment.routes.js` or a new `patient.routes.js`.
      // Actually, since appointments are already linked to patients, the receptionist can search appointments. But what if they want to book a new appointment for an existing patient?
      // They need to search the `Patient` collection to find the patient and retrieve their `patientId`.
      // Let's check: we can add a route `GET /api/v1/appointments` or a dedicated route `GET /api/v1/appointments/patients/search` in `appointment.routes.js`!
      // Let's double check if we did this. We can just add a quick helper route in `appointment.routes.js`:
      // `router.get('/patients/search', restrictTo('receptionist', 'super_admin'), appointmentController.searchPatients);`
      // Let's check if we have this or if we should add it!
      // Let's add it! That is a very clean solution.
      // Wait, let's write the receptionist search patient integration first. It makes a request to `/appointments/patients/search?q=query`.
      // Let's implement this!
      const response = await api.get(`/appointments/patients/search?q=${searchQuery}`);
      setSearchResults(response.data.data);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    try {
      // In EMR system, creating a patient profile is done directly.
      // Let's add a route `POST /api/v1/appointments/patients` or register them when booking.
      // Wait! The receptionist can register a patient when booking.
      // If we want a separate registration endpoint, we can add `POST /api/v1/appointments/patients`.
      // Let's make it hit `POST /api/v1/appointments/patients` and return the patient profile details.
      const response = await api.post('/appointments/patients', {
        name: patientName,
        mobileNumber: patientMobile,
        email: patientEmail,
        dateOfBirth: patientDob,
        gender: patientGender
      });
      
      const newPatient = response.data.data;
      setRegSuccess(`Patient ${newPatient.name} registered successfully! ID: ${newPatient.patientId}`);
      
      // Auto fill in search results
      setSearchResults([newPatient]);
      setHasSearched(true);
      
      // Clear form
      setPatientName('');
      setPatientMobile('');
      setPatientEmail('');
      setPatientDob('');
      setPatientGender('male');
      setShowRegForm(false);
    } catch (err) {
      setRegError(err.response?.data?.message || 'Failed to register patient');
    }
  };

  const handleMarkArrived = async (id) => {
    try {
      await api.post(`/appointments/${id}/arrive`);
      // Update local state
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
        <p>Manage patient lookup, new patient registrations, and today's schedule status flow.</p>
      </div>

      <div className="receptionist-grid">
        
        {/* LEFT COLUMN: PATIENT LOOKUP & ACTIONS */}
        <div className="lookup-column">
          
          {/* SEARCH CARD */}
          <div className="glass-card action-card">
            <div className="card-header-flex">
              <h2>Patient Search</h2>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowRegForm(!showRegForm);
                  setRegError('');
                  setRegSuccess('');
                }}
              >
                <UserPlus size={16} />
                {showRegForm ? 'Cancel Registration' : 'Register New Patient'}
              </button>
            </div>

            {!showRegForm ? (
              <>
                <form onSubmit={handlePatientSearch} className="search-form">
                  <div className="search-input-wrap">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      className="form-input search-input"
                      placeholder="Search by Patient ID, Name, or Mobile..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={searchLoading}>
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
                </form>

                <div className="search-results-section">
                  {searchLoading && <p className="status-text">Searching records...</p>}
                  
                  {hasSearched && !searchLoading && searchResults.length === 0 && (
                    <div className="no-results-alert">
                      <AlertCircle size={18} />
                      <p>No patient record found. Click "Register New Patient" above.</p>
                    </div>
                  )}

                  {searchResults.map((patient) => (
                    <div key={patient._id} className="patient-result-card glass-card">
                      <div className="patient-avatar">
                        <User size={20} />
                      </div>
                      <div className="patient-info-summary">
                        <h3>{patient.name}</h3>
                        <span className="p-id">{patient.patientId}</span>
                        <div className="p-contact">
                          <span><Phone size={12} /> {patient.mobileNumber}</span>
                          <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        className="btn btn-primary btn-sm book-now-btn"
                        onClick={() => navigate('/scheduler', { state: { patient } })}
                      >
                        <Calendar size={14} />
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterPatient} className="registration-form animate-fade-in">
                {regError && <div className="form-alert alert-danger">{regError}</div>}
                
                <div className="form-group">
                  <label className="form-label">Patient Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Robert Downey"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="10-digit mobile"
                    value={patientMobile}
                    onChange={(e) => setPatientMobile(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. robert@gmail.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-input"
                      value={patientDob}
                      onChange={(e) => setPatientDob(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full">
                  Register Patient Profile
                </button>
              </form>
            )}

            {regSuccess && (
              <div className="form-alert alert-success animate-fade-in" style={{ marginTop: '16px' }}>
                {regSuccess}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: TODAY'S APPOINTMENTS LIST */}
        <div className="appointments-column">
          <div className="glass-card list-card">
            <h2>Today's Appointments Queue</h2>
            
            {appointmentsLoading ? (
              <p className="status-text">Loading today's schedule...</p>
            ) : todayAppointments.length === 0 ? (
              <p className="status-text">No appointments booked for today yet.</p>
            ) : (
              <div className="today-appointments-list">
                {todayAppointments.map((app) => (
                  <div key={app._id} className="today-app-item glass-card">
                    <div className="app-time-badge">
                      <span>{app.slot.startTime}</span>
                    </div>
                    <div className="app-patient-info">
                      <h4>{app.patient?.name}</h4>
                      <span>ID: {app.patient?.patientId} | Dr. {app.doctor?.name}</span>
                    </div>
                    <div className="app-status-actions">
                      <span className={`badge badge-${app.status}`}>
                        {app.status}
                      </span>
                      
                      {app.status === 'scheduled' && (
                        <div className="action-buttons-wrap">
                          <button
                            className="action-icon-btn btn-arrive"
                            title="Mark Patient Arrived"
                            onClick={() => handleMarkArrived(app._id)}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            className="action-icon-btn btn-cancel"
                            title="Cancel Appointment"
                            onClick={() => handleCancelAppointment(app._id)}
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
        </div>

      </div>
    </div>
  );
};

export default ReceptionistDashboard;
