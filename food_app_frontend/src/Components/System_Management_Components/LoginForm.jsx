import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!username || !password) {
      setError('Both fields are required.');
      return;
    }
  
    try {
      // Get CSRF token from cookies
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
  
      // Call the Django business logic layer
      const response = await axios.post(
        '/system_management/login/',  // This should match your Django URLs
        { 
          email: username,  // Using username field as email since that's what backend expects
          password, 
          rememberMe 
        },
        {
          headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.data.status === 'success') {
        setError('');
        // Store the token if it's returned
        if (response.data.data?.token) {
          console.log('Storing Token:'); // Console log for the token

          const token = response.data.data.token;
          console.log('Login successful. Token:', token); // Console log for the token
          localStorage.setItem('authToken', token);
          
          console.log('Token stored in localStorage:', localStorage.getItem('authToken')); // Check if it's stored

        }
        
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
      console.error('Login error:', error.response || error);
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2 className="login-title">Sign In</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;