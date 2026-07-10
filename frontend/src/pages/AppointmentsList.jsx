import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import Navbar from '../components/Navbar.jsx';
import Pagination from '../components/Pagination.jsx';
import { 
  Search, 
  Filter, 
  Calendar, 
  Check, 
  X,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import './AppointmentsList.css';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);

  // Filters State
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [mobileSearch, setMobileSearch] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination & Sorting State
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const [doctorsList, setDoctorsList] = useState([]);
  const [depts] = useState(['Cardiology', 'Pediatrics', 'Dermatology', 'General Medicine', 'Orthopedics']);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctorsList(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Build query string
      let url = `/appointments?page=${page}&limit=10&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      
      if (patientSearch) url += `&patientSearch=${patientSearch}`;
      if (doctorSearch) url += `&doctorSearch=${doctorSearch}`;
      if (mobileSearch) url += `&mobileSearch=${mobileSearch}`;
      if (status) url += `&status=${status}`;
      if (department) url += `&department=${department}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await api.get(url);
      setAppointments(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [page, sortBy, sortOrder]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAppointments();
  };

  const handleResetFilters = () => {
    setPatientSearch('');
    setDoctorSearch('');
    setMobileSearch('');
    setStatus('');
    setDepartment('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    // Trigger immediate reload
    setTimeout(() => {
      fetchAppointments();
    }, 100);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleMarkArrived = async (id) => {
    try {
      await api.post(`/appointments/${id}/arrive`);
      setAppointments((prev) =>
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
      setAppointments((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: 'cancelled' } : app))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-main-content appointments-list-page">
        <div className="list-page-header">
          <h1>Clinic Appointments Ledger</h1>
          <p>Search, filter, and audit appointments across patient, doctor, and date criteria.</p>
        </div>

        {/* FILTERS CONTAINER */}
        <form onSubmit={handleApplyFilters} className="glass-card filter-card animate-fade-in">
          <div className="filter-header">
            <Filter size={18} />
            <h2>Search and Filtering Parameters</h2>
          </div>
          
          <div className="filter-inputs-grid">
            <div className="form-group">
              <label className="form-label">Patient Lookup</label>
              <div className="input-with-icon">
                <Search size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-input icon-padding"
                  placeholder="ID or Name..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Mobile Search..."
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Practitioner Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Doctor Search..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {depts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Booking Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="arrived">Arrived</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>
              Reset Filters
            </button>
            <button type="submit" className="btn btn-primary">
              Apply Filters
            </button>
          </div>
        </form>

        {/* RESULTS TABLE CARD */}
        <div className="glass-card table-card animate-fade-in" style={{ marginTop: '24px' }}>
          
          <div className="table-header-flex">
            <h2>Appointments Listing</h2>
            <span className="results-count">Total Matches: {meta.total}</span>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('date')} className="sortable-col">
                    Date <ArrowUpDown size={14} />
                  </th>
                  <th>Slot Time</th>
                  <th>Patient Name</th>
                  <th>Patient ID</th>
                  <th>Practitioner</th>
                  <th>Department</th>
                  <th onClick={() => handleSort('status')} className="sortable-col">
                    Status <ArrowUpDown size={14} />
                  </th>
                  <th>Purpose</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      Fetching matching appointments ledger...
                    </td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      No matching appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((app) => (
                    <tr key={app._id}>
                      <td className="font-semibold">
                        {new Date(app.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="font-semibold text-teal-400">
                        {app.slot?.startTime}
                      </td>
                      <td className="doc-table-name">{app.patient?.name}</td>
                      <td className="font-mono text-xs">{app.patient?.patientId}</td>
                      <td>Dr. {app.doctor?.name}</td>
                      <td><span className="badge-dept">{app.department}</span></td>
                      <td>
                        <span className={`badge badge-${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="purpose-cell-text" title={app.purpose}>
                        {app.purpose}
                      </td>
                      <td>
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
                        {app.status === 'completed' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
                        )}
                        {app.status === 'cancelled' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
                        )}
                        {app.status === 'arrived' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>In Session</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination meta={meta} onPageChange={(p) => setPage(p)} />

        </div>
      </main>
    </div>
  );
};

export default AppointmentsList;
