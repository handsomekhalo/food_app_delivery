import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Navbar } from './Components/System_Management_Components/NavBar';
import { HeroSection } from './Components/System_Management_Components/HeroSection';
import LoginForm from './Components/System_Management_Components/LoginForm'; // Import your LoginForm component
import { Dashboard } from './Components/System_Management_Components/Dashboard/Dashboard';
import SideBar from './Components/System_Management_Components/Dashboard/SideBar';
import UserManagement from './Components/System_Management_Components/Dashboard/UserManagement';
import AddAdmin from './Components/System_Management_Components/Dashboard/AddAdmin';

function App() {
  return (
    <Router> {/* Wrap the entire app with BrowserRouter */}
      <div className="app-container">
        {/* Navbar always visible */}
        <Navbar />

        {/* Render different pages based on the route */}
        <Routes>
          <Route path="/" element={<HeroSection />} /> {/* Landing page */}
          <Route path="/login" element={<LoginForm />} /> {/* Login page */}
          <Route path="/dashboard" element={<Dashboard />} /> {/* Login page */}
          <Route path="/sidebar" element={<SideBar />} /> {/* Side bar */}
          <Route path="/user_management" element={<UserManagement />} />
          <Route path="/add-admin" element={<AddAdmin />} />

          

          
        </Routes>
      </div>
    </Router>
  );
}

export default App;