import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Navbar } from './Components/System_Management_Components/NavBar';
import { HeroSection } from './Components/System_Management_Components/HeroSection';
import LoginForm from './Components/System_Management_Components/LoginForm';
import { Dashboard } from './Components/System_Management_Components/Dashboard/Dashboard';
import SideBar from './Components/System_Management_Components/Dashboard/SideBar';
import UserManagement from './Components/System_Management_Components/Dashboard/UserManagement';
import AddAdmin from './Components/System_Management_Components/Dashboard/AddAdmin';
import { AuthProvider } from './AuthContext';
import UpdateUserModal from './Components/System_Management_Components/Dashboard/UpdateUserModal';
import Restaurent_management from './Components/Restaurent_Components/Restaurent_management';
import AddRestaurent from './Components/Restaurent_Components/AddRestaurent';

function App() {
  return (
    <Router> {/* Ensure Router wraps everything */}
      <AuthProvider> {/* Place AuthProvider inside Router */}
        <div className="app-container">
          {/* Navbar always visible */}
          <Navbar />

          {/* Render different pages based on the route */}
          <Routes>
            <Route path="/" element={<HeroSection />} /> {/* Landing page */}
            <Route path="/login" element={<LoginForm />} /> {/* Login page */}
            <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard */}
            <Route path="/sidebar" element={<SideBar />} /> {/* Side bar */}
            <Route path="/user_management" element={<UserManagement />} />
            <Route path="/add-admin" element={<AddAdmin />} />
            <Route path="/update-admin" element={<UpdateUserModal />} />
            <Route path="/restaurent_management" element={<Restaurent_management />} />
            <Route path="/add-restaurant" element={<AddRestaurent />} />
          </Routes>
    
   
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
