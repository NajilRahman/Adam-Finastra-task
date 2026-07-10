import React, { useState } from 'react';
import Input from '../../ui/Input.jsx';
import Select from '../../ui/Select.jsx';
import Button from '../../ui/Button.jsx';

/**
 * Doctor Registration form for super admins
 */
const DoctorForm = ({ onSubmit, loading }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, email, password, department, specialization, contactNumber });
    // Reset inputs
    setName('');
    setEmail('');
    setPassword('');
    setDepartment('');
    setSpecialization('');
    setContactNumber('');
  };

  const deptOptions = [
    { value: '', label: 'Select Department' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Dermatology', label: 'Dermatology' },
    { value: 'General Medicine', label: 'General Medicine' },
    { value: 'Orthopedics', label: 'Orthopedics' }
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div 
        className="form-grid" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px', 
          marginBottom: '24px' 
        }}
      >
        <Input
          label="Full Name"
          id="docName"
          placeholder="e.g. Dr. Sarah Jenkins"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email Address (Login ID)"
          id="docEmail"
          type="email"
          placeholder="e.g. sjenkins@aura.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Portal Password"
          id="docPassword"
          type="password"
          placeholder="Min 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Select
          label="Medical Department"
          id="docDept"
          options={deptOptions}
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        />
        <Input
          label="Specialization Details"
          id="docSpecialization"
          placeholder="e.g. Pediatric Pulmonology"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          required
        />
        <Input
          label="Contact / Mobile Number"
          id="docContact"
          type="tel"
          placeholder="10-digit number"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          required
        />
      </div>
      <Button type="submit" loading={loading} disabled={loading}>
        Create Account & Profile
      </Button>
    </form>
  );
};

export default DoctorForm;
