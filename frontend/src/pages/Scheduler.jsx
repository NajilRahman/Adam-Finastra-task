import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api.js';
import { initiateSocket, disconnectSocket } from '../utils/socket.js';
import Navbar from '../components/Navbar.jsx';
import SlotGrid from '../components/SlotGrid.jsx';
import Modal from '../components/Modal.jsx';
import { 
  CalendarDays, 
  User, 
  Stethoscope, 
  Clock, 
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import './Scheduler.css';

const Scheduler = () => {
  const location = useLocation();

  // Selected Doctor, Department, and Date
  const [departments, setDepartments] = useState(['Cardiology', 'Pediatrics', 'Dermatology', 'General Medicine', 'Orthopedics']);
  const [selectedDept, setSelectedDept] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  // Slots State
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Booking Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Patient details state
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientMobile, setPatientMobile] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientDob, setPatientDob] = useState('');
  const [patientGender, setPatientGender] = useState('male');
  const [bookingPurpose, setBookingPurpose] = useState('');

  // Alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [modalError, setModalError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch doctors list
  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data.data);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter doctors by department
  const filteredDoctors = selectedDept 
    ? doctors.filter((doc) => doc.department === selectedDept) 
    : doctors;

  // Auto-select first doctor in department if list changes
  useEffect(() => {
    if (filteredDoctors.length > 0) {
      // Check if current doctor is in filtered list
      const exists = filteredDoctors.some(d => d._id === selectedDocId);
      if (!exists) {
        setSelectedDocId(filteredDoctors[0]._id);
      }
    } else {
      setSelectedDocId('');
    }
  }, [selectedDept, doctors]);

  // Fetch Slots
  const fetchSlots = async () => {
    if (!selectedDocId || !selectedDate) {
      setSlots([]);
      return;
    }

    setSlotsLoading(true);
    try {
      const response = await api.get(`/slots?doctorId=${selectedDocId}&date=${selectedDate}`);
      setSlots(response.data.data);
    } catch (err) {
      console.error('Failed to load slots:', err);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedDocId, selectedDate]);

  // Socket.IO Real-Time Listeners
  useEffect(() => {
    const socket = initiateSocket();
    
    // Connect socket if not connected
    if (socket && !socket.connected) {
      socket.connect();
    }

    // Listener for newly created appointments
    const handleAppointmentCreated = (newApp) => {
      // If the appointment matches our active doctor, date, we update that slot to booked!
      const appDateStr = new Date(newApp.date).toISOString().split('T')[0];
      if (
        String(newApp.doctor?._id || newApp.doctor) === String(selectedDocId) &&
        appDateStr === selectedDate
      ) {
        setSlots((prevSlots) =>
          prevSlots.map((slot) =>
            slot.startTime === newApp.slot.startTime
              ? { ...slot, isBooked: true, isAvailable: false }
              : slot
          )
        );
      }
    };

    // Listener for cancelled appointments
    const handleAppointmentCancelled = (cancelledInfo) => {
      const appDateStr = new Date(cancelledInfo.date).toISOString().split('T')[0];
      if (
        String(cancelledInfo.doctor) === String(selectedDocId) &&
        appDateStr === selectedDate
      ) {
        setSlots((prevSlots) =>
          prevSlots.map((slot) =>
            slot.startTime === cancelledInfo.slot.startTime
              ? { ...slot, isBooked: false, isAvailable: !slot.isPast }
              : slot
          )
        );
      }
    };

    if (socket) {
      socket.on('appointment:created', handleAppointmentCreated);
      socket.on('appointment:updated', handleAppointmentCreated); // also updates status changes
      socket.on('appointment:cancelled', handleAppointmentCancelled);
    }

    return () => {
      if (socket) {
        socket.off('appointment:created', handleAppointmentCreated);
        socket.off('appointment:updated', handleAppointmentCreated);
        socket.off('appointment:cancelled', handleAppointmentCancelled);
      }
    };
  }, [selectedDocId, selectedDate]);

  // Handle pre-populated patient from Receptionist redirect
  useEffect(() => {
    if (location.state?.patient) {
      const patient = location.state.patient;
      setIsNewPatient(false);
      setPatientId(patient.patientId);
      setPatientName(patient.name);
      setPatientMobile(patient.mobileNumber);
      // Auto open modal if slot is selected
    }
  }, [location.state]);

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setModalError('');
    setBookingLoading(true);

    const docObj = doctors.find(d => d._id === selectedDocId);

    const bookingPayload = {
      isNewPatient,
      doctor: selectedDocId,
      department: docObj?.department || 'General Medicine',
      date: selectedDate,
      slot: {
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      },
      purpose: bookingPurpose
    };

    if (isNewPatient) {
      bookingPayload.patientName = patientName;
      bookingPayload.patientMobile = patientMobile;
      bookingPayload.patientEmail = patientEmail;
      bookingPayload.patientDob = patientDob;
      bookingPayload.patientGender = patientGender;
    } else {
      bookingPayload.patientId = patientId;
    }

    try {
      await api.post('/appointments', bookingPayload);
      
      setSuccessMsg(`Appointment booked successfully for ${isNewPatient ? patientName : 'Patient ' + patientId} at ${selectedSlot.startTime}!`);
      setIsModalOpen(false);
      
      // Reset forms
      setBookingPurpose('');
      if (isNewPatient) {
        setPatientName('');
        setPatientMobile('');
        setPatientEmail('');
        setPatientDob('');
        setPatientGender('male');
      } else {
        setPatientId('');
      }

      // Refresh slots
      fetchSlots();

      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to book appointment. The slot may have just been taken.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-main-content scheduler-page">
        <div className="scheduler-header">
          <h1>Clinic Appointment Scheduler</h1>
          <p>Filter doctor schedules, view real-time slot grids, and process patient bookings.</p>
        </div>

        {successMsg && (
          <div className="alert alert-success animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto 20px auto' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="scheduler-layout-grid glass-card">
          
          {/* SCHEDULER FILTERS */}
          <div className="scheduler-filters-sidebar">
            <h2>Search Filters</h2>
            
            <div className="form-group">
              <label className="form-label">Clinic Department</label>
              <select
                className="form-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Practitioner</label>
              <select
                className="form-select"
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                required
              >
                <option value="">Choose doctor...</option>
                {filteredDoctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} ({doc.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Date</label>
              <input
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* SCHEDULER SLOTS GRID */}
          <div className="scheduler-grid-body">
            {selectedDocId ? (
              <>
                <div className="grid-header-details">
                  <h3>
                    Dr. {doctors.find(d => d._id === selectedDocId)?.name}'s Schedule
                  </h3>
                  <span>Date: {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                {slotsLoading ? (
                  <p className="slots-loading-text">Generating available slots...</p>
                ) : (
                  <SlotGrid
                    slots={slots}
                    selectedSlot={selectedSlot}
                    onSelectSlot={handleSelectSlot}
                  />
                )}
              </>
            ) : (
              <div className="select-prompt-placeholder">
                <CalendarDays size={48} />
                <h3>Select Practitioner</h3>
                <p>Choose a department and doctor from the sidebar to load the appointment time slots grid.</p>
              </div>
            )}
          </div>

        </div>

        {/* BOOKING MODAL */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Book Appointment - ${selectedSlot?.startTime}`}
        >
          <form onSubmit={handleBookAppointment} className="booking-modal-form">
            {modalError && (
              <div className="alert alert-danger" style={{ marginBottom: '16px', padding: '10px' }}>
                <AlertCircle size={16} />
                <span>{modalError}</span>
              </div>
            )}

            <div className="patient-type-tabs">
              <button
                type="button"
                className={`type-tab-btn ${isNewPatient ? 'active' : ''}`}
                onClick={() => setIsNewPatient(true)}
              >
                New Patient
              </button>
              <button
                type="button"
                className={`type-tab-btn ${!isNewPatient ? 'active' : ''}`}
                onClick={() => setIsNewPatient(false)}
              >
                Existing Patient
              </button>
            </div>

            {isNewPatient ? (
              /* NEW PATIENT FORM FIELDS */
              <div className="patient-form-fields animate-fade-in">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Patient Name"
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
                    placeholder="10-digit number"
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
                    placeholder="email@example.com"
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
              </div>
            ) : (
              /* EXISTING PATIENT FORM FIELDS */
              <div className="patient-form-fields animate-fade-in">
                <div className="form-group">
                  <label className="form-label">Patient ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. P-20260710-3849"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                  />
                </div>
                {location.state?.patient && (
                  <div className="alert alert-success" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                    Patient Loaded: <strong>{location.state.patient.name}</strong> ({location.state.patient.mobileNumber})
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Purpose of Appointment</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Describe consultation reason..."
                value={bookingPurpose}
                onChange={(e) => setBookingPurpose(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="modal-footer-btns">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={bookingLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Processing Booking...' : 'Confirm Appointment'}
              </button>
            </div>

          </form>
        </Modal>

      </main>
    </div>
  );
};

export default Scheduler;
