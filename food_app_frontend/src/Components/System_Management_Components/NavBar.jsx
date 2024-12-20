import React from 'react';
import { useNavigate } from 'react-router-dom';  // Import the useNavigate hook

export const Navbar = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Function to navigate to the login page
  const handleLoginClick = () => {
    navigate('/login'); // Navigate to the login page (you can change the path if needed)
  };

  return (
    <nav className="navbar">
      <div className="logo">Panpie <span>Quality Food</span></div>
      <ul className="nav-links">
        <li>Home</li>
        <li>About</li>
        <li>Menu</li>
        <li>Contact</li>
      </ul>
      <button className="log-in-btn" onClick={handleLoginClick}>Log In</button> {/* Trigger navigation on button click */}
    </nav>
  );
};
