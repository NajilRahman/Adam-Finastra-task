import React, { useState } from 'react';
import Select from '../../ui/Select.jsx';
import Button from '../../ui/Button.jsx';
import { Plus, Trash } from 'lucide-react';

/**
 * Configure practitioner slot schedules, including working days, duration, daily sessions, and breaks
 */
const ScheduleConfigForm = ({ doctors = [], onSubmit, loading }) => {
  const [schedDoctorId, setSchedDoctorId] = useState('');
  const [schedDays, setSchedDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri default
  const [schedDuration, setSchedDuration] = useState(15);
  const [sessions, setSessions] = useState([
    { name: 'Morning Session', startTime: '09:00', endTime: '12:00' },
    { name: 'Evening Session', startTime: '13:00', endTime: '17:00' }
  ]);
  const [breaks, setBreaks] = useState([
    { name: 'Lunch Break', startTime: '12:00', endTime: '13:00' }
  ]);

  const weekdays = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 }
  ];

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
    setSessions(sessions.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleAddBreak = () => {
    setBreaks([...breaks, { name: 'Break', startTime: '12:00', endTime: '13:00' }]);
  };

  const handleRemoveBreak = (index) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };

  const handleBreakChange = (index, field, value) => {
    setBreaks(breaks.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!schedDoctorId) {
      alert('Please select a doctor');
      return;
    }
    if (schedDays.length === 0) {
      alert('Select at least one working day');
      return;
    }
    if (sessions.length === 0) {
      alert('Configure at least one working session');
      return;
    }
    onSubmit({
      doctorId: schedDoctorId,
      workingDays: schedDays,
      slotDuration: Number(schedDuration),
      sessions,
      breakTimings: breaks
    });
  };

  const docOptions = [
    { value: '', label: 'Choose a doctor...' },
    ...doctors.map(d => ({ value: d._id, label: `${d.name} (${d.department})` }))
  ];

  const durationOptions = [
    { value: 10, label: '10 Minutes' },
    { value: 15, label: '15 Minutes (Default)' },
    { value: 20, label: '20 Minutes' },
    { value: 30, label: '30 Minutes' },
    { value: 45, label: '45 Minutes' },
    { value: 60, label: '60 Minutes' }
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px', 
          marginBottom: '24px' 
        }}
      >
        <Select
          label="Select Practitioner"
          id="schedDoctorId"
          options={docOptions}
          value={schedDoctorId}
          onChange={(e) => setSchedDoctorId(e.target.value)}
          required
        />
        <Select
          label="Appointment Duration"
          id="schedDuration"
          options={durationOptions}
          value={schedDuration}
          onChange={(e) => setSchedDuration(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Practicing Days</label>
        <div className="days-checkbox-grid" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {weekdays.map((day) => {
            const isChecked = schedDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                className={`day-selector-btn ${isChecked ? 'selected' : ''}`}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                  backgroundColor: isChecked ? 'var(--primary-glow)' : 'transparent',
                  color: isChecked ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.15s ease-in-out'
                }}
                onClick={() => handleDayToggle(day.value)}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div 
        className="schedule-timings-section" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
          gap: '24px', 
          marginTop: '24px' 
        }}
      >
        
        {/* Sessions column */}
        <div 
          className="timings-column" 
          style={{ 
            border: '1px solid var(--border-light)', 
            padding: '20px', 
            borderRadius: '8px', 
            backgroundColor: '#f8fafc' 
          }}
        >
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px', 
              borderBottom: '1px solid var(--border-light)', 
              paddingBottom: '10px' 
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>
              Active Daily Sessions
            </h3>
            <button 
              type="button" 
              className="btn-add-timing" 
              style={{ 
                border: '1px solid var(--primary)', 
                background: 'transparent', 
                color: 'var(--primary)', 
                padding: '4px 10px', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontSize: '0.8rem', 
                fontWeight: 500 
              }} 
              onClick={handleAddSession}
            >
              <Plus size={14} /> Add Session
            </button>
          </div>

          {sessions.map((session, index) => (
            <div 
              key={index} 
              className="timing-row" 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}
            >
              <input
                type="text"
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Session Name"
                value={session.name}
                onChange={(e) => handleSessionChange(index, 'name', e.target.value)}
                required
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="text"
                  className="form-input text-center"
                  style={{ width: '80px', textAlign: 'center' }}
                  placeholder="HH:MM"
                  value={session.startTime}
                  onChange={(e) => handleSessionChange(index, 'startTime', e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>to</span>
                <input
                  type="text"
                  className="form-input text-center"
                  style={{ width: '80px', textAlign: 'center' }}
                  placeholder="HH:MM"
                  value={session.endTime}
                  onChange={(e) => handleSessionChange(index, 'endTime', e.target.value)}
                  required
                />
              </div>
              {sessions.length > 1 && (
                <button 
                  type="button" 
                  className="btn-delete-row" 
                  style={{ 
                    background: 'transparent', 
                    border: '1px solid #fecaca', 
                    color: '#dc2626', 
                    padding: '8px', 
                    borderRadius: '6px', 
                    cursor: 'pointer' 
                  }} 
                  onClick={() => handleRemoveSession(index)}
                >
                  <Trash size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Breaks column */}
        <div 
          className="timings-column" 
          style={{ 
            border: '1px solid var(--border-light)', 
            padding: '20px', 
            borderRadius: '8px', 
            backgroundColor: '#f8fafc' 
          }}
        >
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px', 
              borderBottom: '1px solid var(--border-light)', 
              paddingBottom: '10px' 
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>
              Break Allocations
            </h3>
            <button 
              type="button" 
              className="btn-add-timing" 
              style={{ 
                border: '1px solid var(--primary)', 
                background: 'transparent', 
                color: 'var(--primary)', 
                padding: '4px 10px', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontSize: '0.8rem', 
                fontWeight: 500 
              }} 
              onClick={handleAddBreak}
            >
              <Plus size={14} /> Add Break
            </button>
          </div>

          {breaks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
              No break allocations configured.
            </p>
          ) : (
            breaks.map((brk, index) => (
              <div 
                key={index} 
                className="timing-row" 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}
              >
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Break Name"
                  value={brk.name}
                  onChange={(e) => handleBreakChange(index, 'name', e.target.value)}
                  required
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    className="form-input text-center"
                    style={{ width: '80px', textAlign: 'center' }}
                    placeholder="HH:MM"
                    value={brk.startTime}
                    onChange={(e) => handleBreakChange(index, 'startTime', e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>to</span>
                  <input
                    type="text"
                    className="form-input text-center"
                    style={{ width: '80px', textAlign: 'center' }}
                    placeholder="HH:MM"
                    value={brk.endTime}
                    onChange={(e) => handleBreakChange(index, 'endTime', e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="button" 
                  className="btn-delete-row" 
                  style={{ 
                    background: 'transparent', 
                    border: '1px solid #fecaca', 
                    color: '#dc2626', 
                    padding: '8px', 
                    borderRadius: '6px', 
                    cursor: 'pointer' 
                  }} 
                  onClick={() => handleRemoveBreak(index)}
                >
                  <Trash size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Button type="submit" loading={loading} disabled={loading}>
          Save Schedule Configuration
        </Button>
      </div>
    </form>
  );
};

export default ScheduleConfigForm;
