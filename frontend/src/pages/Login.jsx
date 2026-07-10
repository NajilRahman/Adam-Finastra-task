import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, setLoading, setError } from '../store/slices/authSlice.js';
import api from '../utils/api.js';
import { connectSocket } from '../utils/socket.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { Activity, Mail, Lock } from 'lucide-react';
import './Login.css';

/**
 * Clean login page using reusable UI components and professional typography
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    dispatch(setLoading(true));
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data.data;
      
      dispatch(setCredentials({ user, accessToken, refreshToken }));
      
      // Connect Socket.io client upon successful login
      connectSocket();
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      dispatch(setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-wrapper enterprise-card animate-fade-in">
        <div className="login-header">
          <div className="login-logo">
            <Activity size={32} />
          </div>
          <h1>Adam Finastra EMR</h1>
          <p>Enterprise Clinic Appointment Manager</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {(formError || error) && (
            <div className="login-error-alert">
              {formError || error}
            </div>
          )}

          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="e.g. receptionist@emr.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
          />

          <Button
            type="submit"
            className="w-full login-btn"
            loading={loading}
            disabled={loading}
            style={{ marginTop: '10px' }}
          >
            Sign In
          </Button>
        </form>

        <div className="login-footer">
          <p>Demo Accounts:</p>
          <span>Admin: admin@emr.com / admin123</span>
          <span>Receptionist: receptionist@emr.com / receptionist123</span>
          <span>Doctor: doctor.smith@emr.com / doctor123</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
