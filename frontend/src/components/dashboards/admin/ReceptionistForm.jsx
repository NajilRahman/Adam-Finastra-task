import React, { useState } from 'react';
import Input from '../../ui/Input.jsx';
import Button from '../../ui/Button.jsx';

/**
 * Receptionist Registration form for super admins
 */
const ReceptionistForm = ({ onSubmit, loading }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, email, password });
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
      <Input
        label="Full Name"
        id="recName"
        placeholder="e.g. Liam Porter"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label="Email Address (Login ID)"
        id="recEmail"
        type="email"
        placeholder="e.g. lporter@aura.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Portal Password"
        id="recPassword"
        type="password"
        placeholder="Min 6 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" loading={loading} disabled={loading}>
        Create Staff Account
      </Button>
    </form>
  );
};

export default ReceptionistForm;
