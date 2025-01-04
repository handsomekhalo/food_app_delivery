import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from './SideBar';
import { useAuth } from "../../../AuthContext";

export const Dashboard = () => {
  const { authToken, isAuthenticated , csrfToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Auth state:', { authToken, isAuthenticated, csrfToken});
    if (!authToken) {
      console.log('No token available, redirecting to login.');
      navigate('/login'); // Redirect to login if no token
    }
  }, [authToken, navigate]);

  if (!authToken) {
    return <div>Loading...</div>; // Render a loading state temporarily
  }

  return (
    <div className="dashboard">
      <SideBar />
      <h1>Welcome to the Dashboard</h1>
    </div>
  );
};

export default Dashboard;
