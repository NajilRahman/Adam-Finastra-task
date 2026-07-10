import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api.js';
import SearchBox from '../../ui/SearchBox.jsx';
import Button from '../../ui/Button.jsx';
import { User, Phone, AlertCircle, Calendar, UserPlus } from 'lucide-react';

/**
 * Handles patient search query lookup and lists result cards with booking shortcuts
 */
const PatientSearch = ({ onToggleRegister }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (val) => {
    if (!val.trim()) return;
    setSearchLoading(true);
    setHasSearched(true);
    try {
      const response = await api.get(`/appointments/patients/search?q=${val}`);
      setSearchResults(response.data.data);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div>
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>
          Patient Lookup
        </h2>
        <Button variant="secondary" onClick={onToggleRegister} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
          <UserPlus size={16} /> Register New Patient
        </Button>
      </div>

      <SearchBox
        placeholder="Search by Patient ID, Name, or Mobile..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onSearch={handleSearch}
        disabled={searchLoading}
      />

      <div style={{ marginTop: '20px' }}>
        {searchLoading && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Searching records...
          </p>
        )}

        {hasSearched && !searchLoading && searchResults.length === 0 && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              backgroundColor: '#fffbeb', 
              border: '1px solid #fde68a', 
              color: '#92400e', 
              padding: '12px', 
              borderRadius: '6px', 
              fontSize: '0.9rem' 
            }}
          >
            <AlertCircle size={18} />
            <p>No patient record found. Create a new profile using the register button above.</p>
          </div>
        )}

        {searchResults.map((patient) => (
          <div 
            key={patient._id} 
            className="patient-result-card" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px', 
              marginBottom: '12px', 
              border: '1px solid var(--border-light)', 
              borderRadius: '6px', 
              backgroundColor: '#f8fafc' 
            }}
          >
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--primary-glow)', 
                color: 'var(--primary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginRight: '12px' 
              }}
            >
              <User size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                {patient.name}
              </h3>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                {patient.patientId}
              </span>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} /> {patient.mobileNumber}
                </span>
                <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
              </div>
            </div>
            <Button
              onClick={() => navigate('/scheduler', { state: { patient } })}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <Calendar size={14} /> Book
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientSearch;
