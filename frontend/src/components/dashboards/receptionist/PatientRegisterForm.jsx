import React, { useState } from 'react';
import Input from '../../ui/Input.jsx';
import Select from '../../ui/Select.jsx';
import Button from '../../ui/Button.jsx';

/**
 * Register profile form for receptionist desk
 */
const PatientRegisterForm = ({ onSubmit, onCancel, loading }) => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('male');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      mobileNumber,
      email,
      dateOfBirth,
      gender
    });
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Patient Name"
        id="patientName"
        placeholder="e.g. Robert Downey"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label="Mobile Number"
        id="patientMobile"
        type="tel"
        placeholder="10-digit mobile number"
        value={mobileNumber}
        onChange={(e) => setMobileNumber(e.target.value)}
        required
      />
      <Input
        label="Email Address (Optional)"
        id="patientEmail"
        type="email"
        placeholder="e.g. robert@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div 
        className="form-grid-2" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '16px' 
        }}
      >
        <Input
          label="Date of Birth"
          id="patientDob"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
        />
        <Select
          label="Gender"
          id="patientGender"
          options={genderOptions}
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        />
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <Button type="button" variant="secondary" onClick={onCancel} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={loading} style={{ flex: 1 }}>
          Register Profile
        </Button>
      </div>
    </form>
  );
};

export default PatientRegisterForm;
