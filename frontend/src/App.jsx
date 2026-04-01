import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import DayscholarDashboard from './pages/Dashboard/DayscholarDashboard';
import HostelerDashboard from './pages/Dashboard/HostelerDashboard';
import SelectRole from './selectRole';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          style: { background: '#111827', color: '#fff', borderRadius: '1rem', fontWeight: 'bold' },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } }
        }} 
      />
      <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* ✅ Clean URLs for role-based dashboards */}
      <Route path="/dayscholar-dashboard" element={<DayscholarDashboard />} />
      <Route path="/hosteler-dashboard" element={<HostelerDashboard />} />

      {/* Optional backward redirects (if you ever used camelCase before) */}
      <Route path="/dayscholarDashboard" element={<Navigate to="/dayscholar-dashboard" />} />
      <Route path="/hostelerDashboard" element={<Navigate to="/hosteler-dashboard" />} />

      <Route path="/select-role" element={<SelectRole />} />
    </Routes>
    </>
  );
};

export default App;
