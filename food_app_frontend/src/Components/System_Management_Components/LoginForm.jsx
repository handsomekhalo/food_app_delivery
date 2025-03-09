// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../AuthContext';

// const LoginForm = () => {
//   const { login: authLogin } = useAuth(); // Rename the login function from context to authLogin
//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//     rememberMe: false,
//   });
//   const [error, setError] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const navigate = useNavigate();

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsSubmitting(true);

//     try {
//       // Get the CSRF token from cookies
//       const csrfToken = document.cookie
//         .split('; ')
//         .find((row) => row.startsWith('csrftoken='))?.split('=')[1];

//         console.log('csrf token is', csrfToken)

//       if (!csrfToken) {
//         setError('CSRF token is missing.');
//         setIsSubmitting(false);
//         return;
//       }



//       // Send login request
//       const response = await axios.post(
//         'http://localhost:8000/system_management/login/',
//         {
//           email: formData.username,
//           password: formData.password,
//           rememberMe: formData.rememberMe,
//         },
//         {
//           headers: {
//             'X-CSRFToken': csrfToken,
//             'Content-Type': 'application/json',
//           },
//           withCredentials: true, // This ensures cookies are sent with the request
//         }
//       );

//       // Check if login was successful
//       if (response.data.status === 'success') {
//         // Parse the stringified JSON data
//         const parsedData = JSON.parse(response.data.data);
//         const { token, first_login, user } = parsedData;

//         console.log('response', response);

//         // Store the token and user data
//         if (token) {
//           await authLogin(token); // Pass token to the AuthContext

//           // Optionally store user data in localStorage or elsewhere if needed
//           localStorage.setItem('user', JSON.stringify(user));

//           // Optionally handle first login or other user-specific logic
//           console.log('First login:', first_login);
//           console.log('User data:', user);

          

//           // Redirect to dashboard or handle post-login logic
//           navigate('/dashboard');
//         } else {
//           setError('No token received from server.');
//         }
//       } else {
//         setError(response.data.message || 'Login failed. Please try again.');
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       setError(err.response?.data?.message || 'An error occurred. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-form-wrapper">
//         <h2 className="login-title">Sign In</h2>
//         {error && <div className="alert alert-danger" role="alert">{error}</div>}
//         <form onSubmit={handleSubmit} noValidate>
//           {/* Username Input */}
//           <div className="form-group">
//             <label htmlFor="username" className="form-label">
//               Username
//             </label>
//             <input
//               id="username"
//               name="username"
//               type="text"
//               className="form-control"
//               placeholder="Enter your username"
//               value={formData.username}
//               onChange={handleInputChange}
//               required
//             />
//           </div>

//           {/* Password Input */}
//           <div className="form-group">
//             <label htmlFor="password" className="form-label">
//               Password
//             </label>
//             <input
//               id="password"
//               name="password"
//               type="password"
//               className="form-control"
//               placeholder="Enter your password"
//               value={formData.password}
//               onChange={handleInputChange}
//               required
//             />
//           </div>

//           {/* Remember Me Checkbox */}
//           <div className="form-group form-check">
//             <input
//               id="rememberMe"
//               name="rememberMe"
//               type="checkbox"
//               className="form-check-input"
//               checked={formData.rememberMe}
//               onChange={handleInputChange}
//             />
//             <label htmlFor="rememberMe" className="form-check-label">
//               Remember Me
//             </label>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="btn btn-primary"
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? 'Logging in...' : 'Login'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LoginForm;
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const LoginForm = () => {
  const { login: authLogin } = useAuth(); // AuthContext login
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
  
    try {
      // Extract CSRF token from cookies
      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrftoken='))?.split('=')[1];
  
      console.log('CSRF Token:', csrfToken); // Print CSRF token to console
  
      if (!csrfToken) {
        setError('CSRF token is missing.');
        setIsSubmitting(false);
        return;
      }
  
      // Login API request
      const response = await axios.post(
        'http://localhost:8000/system_management/login/',
        {
          email: formData.username,
          password: formData.password,
          rememberMe: formData.rememberMe,
        },
        {
          headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
          },
          withCredentials: true, // Ensure cookies are sent
        }
      );
  
      // Handle successful login
      if (response.data.status === 'success') {
        const parsedData = JSON.parse(response.data.data);
        const { token, first_login, user } = parsedData;
  
        if (token) {
          authLogin(token, csrfToken); // Pass auth token and CSRF token to AuthContext
          localStorage.setItem('user', JSON.stringify(user)); // Optionally store user data
  
          navigate('/dashboard'); // Redirect
        } else {
          setError('No token received from server.');
        }
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError('');
  //   setIsSubmitting(true);

  //   try {
  //     // Extract CSRF token from cookies
  //     const csrfToken = document.cookie
  //       .split('; ')
  //       .find((row) => row.startsWith('csrftoken='))?.split('=')[1];

  //     if (!csrfToken) {
  //       setError('CSRF token is missing.');
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     // Login API request
  //     const response = await axios.post(
  //       'http://localhost:8000/system_management/login/',
  //       {
  //         email: formData.username,
  //         password: formData.password,
  //         rememberMe: formData.rememberMe,
  //       },
  //       {
  //         headers: {
  //           'X-CSRFToken': csrfToken,
  //           'Content-Type': 'application/json',
  //         },
  //         withCredentials: true, // Ensure cookies are sent
  //       }
  //     );

  //     // Handle successful login
  //     if (response.data.status === 'success') {
  //       const parsedData = JSON.parse(response.data.data);
  //       const { token, first_login, user } = parsedData;

  //       if (token) {
  //         authLogin(token, csrfToken); // Pass auth token and CSRF token to AuthContext
  //         localStorage.setItem('user', JSON.stringify(user)); // Optionally store user data

  //         navigate('/dashboard'); // Redirect
  //       } else {
  //         setError('No token received from server.');
  //       }
  //     } else {
  //       setError(response.data.message || 'Login failed. Please try again.');
  //     }
  //   } catch (err) {
  //     console.error('Login error:', err);
  //     setError(err.response?.data?.message || 'An error occurred. Please try again.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2 className="login-title">Sign In</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group form-check">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              className="form-check-input"
              checked={formData.rememberMe}
              onChange={handleInputChange}
            />
            <label htmlFor="rememberMe" className="form-check-label">
              Remember Me
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

