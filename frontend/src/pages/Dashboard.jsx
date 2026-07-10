import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice.js';
import Navbar from '../components/Navbar.jsx';
import AdminDashboard from '../components/dashboards/AdminDashboard.jsx';
import ReceptionistDashboard from '../components/dashboards/ReceptionistDashboard.jsx';
import DoctorDashboard from '../components/dashboards/DoctorDashboard.jsx';
import './Dashboard.css';

const Dashboard = () => {
  const user = useSelector(selectCurrentUser);

  const renderDashboardByRole = () => {
    switch (user?.role) {
      case 'super_admin':
        return <AdminDashboard />;
      case 'receptionist':
        return <ReceptionistDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      default:
        return (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Unauthorized</h2>
            <p>You do not have a valid portal role assigned. Contact clinic administrator.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Nav */}
      <Navbar />
      
      {/* Main Panel Content */}
      <main className="dashboard-main-content">
        {renderDashboardByRole()}
      </main>
    </div>
  );
};

export default Dashboard;
