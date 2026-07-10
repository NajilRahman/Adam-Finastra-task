import React from 'react';
import Button from '../../ui/Button.jsx';
import Badge from '../../ui/Badge.jsx';
import { User, Clipboard, FileText, Save } from 'lucide-react';

/**
 * Consultation card showing selected patient's EMR details and a clinical note editor
 */
const ConsultationPanel = ({
  selectedApp,
  notes,
  setNotes,
  onSubmit,
  actionSuccess,
  actionError
}) => {
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

  const isFormDisabled = selectedApp.status === 'completed' || selectedApp.status === 'cancelled';

  return (
    <div className="consultation-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div 
        className="consultation-header" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid var(--border-light)', 
          paddingBottom: '16px' 
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>
          Clinical Consultation
        </h2>
        <Badge status={selectedApp.status} />
      </div>

      {/* Patient Profile Box */}
      <div 
        className="patient-profile-box" 
        style={{ 
          backgroundColor: '#f8fafc', 
          border: '1px solid var(--border-light)', 
          borderRadius: '6px', 
          padding: '16px', 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '16px' 
        }}
      >
        <div 
          className="patient-icon-wrap" 
          style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--primary-glow)', 
            color: 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <User size={20} />
        </div>
        <div 
          className="profile-details-grid" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
            gap: '12px', 
            flex: 1 
          }}
        >
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 500 }}>
              Patient Name
            </label>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>
              {selectedApp.patient?.name}
            </p>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 500 }}>
              Patient ID
            </label>
            <p 
              className="patient-id-num" 
              style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', marginBottom: 0 }}
            >
              {selectedApp.patient?.patientId}
            </p>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 500 }}>
              Age / Gender
            </label>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>
              {calculateAge(selectedApp.patient?.dateOfBirth)} Yrs / {selectedApp.patient?.gender}
            </p>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 500 }}>
              Mobile Number
            </label>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>
              {selectedApp.patient?.mobileNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="appointment-purpose-box">
        <label 
          style={{ 
            fontSize: '0.85rem', 
            color: 'var(--text-secondary)', 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            marginBottom: '6px' 
          }}
        >
          <Clipboard size={14} /> Purpose of Visit
        </label>
        <p 
          style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-primary)', 
            backgroundColor: '#f1f5f9', 
            padding: '12px', 
            borderRadius: '6px', 
            borderLeft: '3px solid var(--primary)', 
            margin: 0 
          }}
        >
          {selectedApp.purpose}
        </p>
      </div>

      {/* Notes Form */}
      <form onSubmit={onSubmit} className="notes-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {actionSuccess && (
          <div 
            className="alert alert-success" 
            style={{ 
              padding: '12px 16px', 
              borderRadius: '6px', 
              backgroundColor: '#ecfdf5', 
              border: '1px solid #a7f3d0', 
              color: '#065f46', 
              fontSize: '0.9rem', 
              fontWeight: 500 
            }}
          >
            {actionSuccess}
          </div>
        )}
        {actionError && (
          <div 
            className="alert alert-danger" 
            style={{ 
              padding: '12px 16px', 
              borderRadius: '6px', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#991b1b', 
              fontSize: '0.9rem', 
              fontWeight: 500 
            }}
          >
            {actionError}
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label 
            className="form-label notes-label" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '0.9rem', 
              fontWeight: 600, 
              color: 'var(--text-primary)', 
              marginBottom: '8px' 
            }}
          >
            <FileText size={16} /> Consultation Notes & Prescription
          </label>
          <textarea
            className="form-textarea notes-textarea"
            rows="8"
            placeholder="Enter clinical symptoms, diagnosis, and prescription details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isFormDisabled}
            required
            style={{ minHeight: '180px', fontFamily: 'inherit', lineHeight: '1.5' }}
          ></textarea>
        </div>

        {!isFormDisabled && (
          <Button type="submit" style={{ alignSelf: 'flex-start' }}>
            <Save size={16} /> Complete & Save Consultation
          </Button>
        )}
      </form>
    </div>
  );
};

export default ConsultationPanel;
