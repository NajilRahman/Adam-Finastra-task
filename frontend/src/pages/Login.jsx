import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, setLoading, setError } from '../store/slices/authSlice.js';
import api from '../utils/api.js';
import { connectSocket } from '../utils/socket.js';
import { ShieldAlert, Mail, Lock } from 'lucide-react';
import './Login.css';

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
      <div className="login-wrapper glass-card animate-fade-in">
        <div className="login-header">
          <div className="login-logo">
            <ShieldAlert size={36} />
          </div>
          <h1>AURA EMR</h1>
          <p>Enterprise Clinic Appointment Manager</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {(formError || error) && (
            <div className="login-error-alert">
              {formError || error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                className="form-input icon-padding"
                placeholder="receptionist@emr.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                className="form-input icon-padding"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full login-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
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
