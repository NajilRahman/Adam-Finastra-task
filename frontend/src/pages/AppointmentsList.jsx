import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import Navbar from '../components/Navbar.jsx';
import Pagination from '../components/Pagination.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Button from '../components/ui/Button.jsx';
import Table from '../components/ui/Table.jsx';
import Badge from '../components/ui/Badge.jsx';
import Card from '../components/ui/Card.jsx';
import { 
  Search, 
  Filter, 
  Check, 
  X,
  ArrowUpDown
} from 'lucide-react';
import './AppointmentsList.css';

/**
 * Appointments ledger page showing filters, search fields, sorting columns, and patient status transitions
 */
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
  
  // Pagination, Sorting & Filter Trigger State
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterTrigger, setFilterTrigger] = useState(0);

  const [depts] = useState(['Cardiology', 'Pediatrics', 'Dermatology', 'General Medicine', 'Orthopedics']);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
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
    fetchAppointments();
  }, [page, sortBy, sortOrder, filterTrigger]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    setFilterTrigger((prev) => prev + 1);
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
    setFilterTrigger((prev) => prev + 1);
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

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'arrived', label: 'Arrived' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const deptOptions = [
    { value: '', label: 'All Departments' },
    ...depts.map(d => ({ value: d, label: d }))
  ];

  const headers = [
    {
      label: 'Date',
      sortable: true,
      onClick: () => handleSort('date'),
      icon: () => <ArrowUpDown size={14} />
    },
    'Slot Time',
    'Patient Name',
    'Patient ID',
    'Practitioner',
    'Department',
    {
      label: 'Status',
      sortable: true,
      onClick: () => handleSort('status'),
      icon: () => <ArrowUpDown size={14} />
    },
    'Purpose',
    'Actions'
  ];

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-main-content appointments-list-page">
        <div className="list-page-header">
          <h1>Appointments Ledger</h1>
          <p>Search, filter, and audit consultations across patient, doctor, and status criteria.</p>
        </div>

        {/* FILTERS CONTAINER */}
        <Card title="Search and Filtering Parameters" subtitle="Narrow down patient records by filters">
          <form onSubmit={handleApplyFilters} className="filter-form">
            <div className="filter-inputs-grid">
              <Input
                label="Patient Lookup"
                id="patientSearch"
                placeholder="ID or Name..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                icon={Search}
              />

              <Input
                label="Mobile Number"
                id="mobileSearch"
                type="tel"
                placeholder="Mobile Search..."
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
              />

              <Input
                label="Practitioner Name"
                id="doctorSearch"
                placeholder="Doctor Search..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
              />

              <Select
                label="Department"
                id="department"
                options={deptOptions}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />

              <Select
                label="Booking Status"
                id="status"
                options={statusOptions}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />

              <Input
                label="Start Date"
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <Input
                label="End Date"
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="filter-actions">
              <Button type="button" variant="secondary" onClick={handleResetFilters}>
                Reset Filters
              </Button>
              <Button type="submit">
                Apply Filters
              </Button>
            </div>
          </form>
        </Card>

        {/* RESULTS TABLE CARD */}
        <div style={{ marginTop: '24px' }}>
          <Card 
            title="Appointments Listing" 
            actions={<span className="results-count">Total Matches: {meta.total}</span>}
          >
            <Table headers={headers} loading={loading} emptyMessage="No matching appointments found.">
              {appointments.map((app) => (
                <tr key={app._id}>
                  <td style={{ fontWeight: 600 }}>
                    {new Date(app.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    {app.slot?.startTime}
                  </td>
                  <td style={{ fontWeight: 600 }}>{app.patient?.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{app.patient?.patientId}</td>
                  <td>Dr. {app.doctor?.name}</td>
                  <td>
                    <span 
                      className="badge-dept" 
                      style={{ 
                        backgroundColor: '#f1f5f9', 
                        border: '1px solid var(--border-light)', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {app.department}
                    </span>
                  </td>
                  <td>
                    <Badge status={app.status} />
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
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>In Session</span>
                    )}
                  </td>
                </tr>
              ))}
            </Table>

            <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AppointmentsList;
