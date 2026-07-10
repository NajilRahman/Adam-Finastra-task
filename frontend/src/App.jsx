import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from './store/slices/authSlice.js';
import { connectSocket, disconnectSocket } from './utils/socket.js';

// Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Scheduler from './pages/Scheduler.jsx';
import AppointmentsList from './pages/AppointmentsList.jsx';

// Route Guard for authenticated users
const ProtectedRoute = ({ children }) => {
  const user = useSelector(selectCurrentUser);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Route Guard for role-based permissions
const RoleRoute = ({ children, allowedRoles }) => {
  const user = useSelector(selectCurrentUser);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (user) {
      connectSocket();
    } else {
      disconnectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [user]);

  return (
    <Routes>
      {/* Public Login Route (Redirects to dashboard if already logged in) */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Shared Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Receptionist & Admin Scheduler Slot Booking */}
      <Route
        path="/scheduler"
        element={
          <RoleRoute allowedRoles={['super_admin', 'receptionist']}>
            <Scheduler />
          </RoleRoute>
        }
      />

      {/* Receptionist & Admin Appointments Ledger */}
      <Route
        path="/appointments"
        element={
          <RoleRoute allowedRoles={['super_admin', 'receptionist']}>
            <AppointmentsList />
          </RoleRoute>
        }
      />

      {/* Fallback Route */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
};

export default App;
