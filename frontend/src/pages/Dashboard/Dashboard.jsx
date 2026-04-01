import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    if (!user || !user.role) {
      navigate('/login');
    } else if (user.role === 'hosteler') {
      navigate('/hosteler-dashboard');
    } else if (user.role === 'dayscholar') {
      navigate('/dayscholar-dashboard');
    }
  }, [navigate]);

  return <div className="min-h-screen bg-[#FFFBF7] animate-pulse"></div>;
};

export default Dashboard;
