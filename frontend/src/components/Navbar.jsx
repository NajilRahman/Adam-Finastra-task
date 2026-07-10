import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials, selectCurrentUser } from '../store/slices/authSlice.js';
import api from '../utils/api.js';
import { disconnectSocket } from '../utils/socket.js';
import { 
  Calendar, 
  Users, 
  LogOut, 
  ShieldAlert, 
  ClipboardList,
  UserCheck
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      disconnectSocket();
      dispatch(clearCredentials());
      navigate('/login');
    }
  };

  if (!user) return null;

  return (
    <aside className="navbar-container">
      <div className="navbar-logo">
        <ShieldAlert size={28} className="logo-icon" />
        <div>
          <h2>AURA EMR</h2>
          <span>Enterprise Portal</span>
        </div>
      </div>

      <div className="navbar-user-card glass-card">
        <div className="user-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="user-details">
          <h4>{user.name}</h4>
          <span className={`role-badge role-${user.role}`}>
            {user.role.replace('_', ' ')}
          </span>
        </div>
      </div>

      <nav className="navbar-links">
        {/* Super Admin Links */}
        {user.role === 'super_admin' && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <ShieldAlert size={18} />
              <span>Admin Console</span>
            </NavLink>
            <NavLink to="/scheduler" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Calendar size={18} />
              <span>Slot Scheduler</span>
            </NavLink>
            <NavLink to="/appointments" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <ClipboardList size={18} />
              <span>Appointments</span>
            </NavLink>
          </>
        )}

        {/* Receptionist Links */}
        {user.role === 'receptionist' && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <UserCheck size={18} />
              <span>Reception Desk</span>
            </NavLink>
            <NavLink to="/scheduler" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Calendar size={18} />
              <span>Slot Grid</span>
            </NavLink>
            <NavLink to="/appointments" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <ClipboardList size={18} />
              <span>Appointments</span>
            </NavLink>
          </>
        )}

        {/* Doctor Links */}
        {user.role === 'doctor' && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <ClipboardList size={18} />
              <span>My Clinic</span>
            </NavLink>
          </>
        )}
      </nav>

      <button className="btn-logout" onClick={handleLogout}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Navbar;
