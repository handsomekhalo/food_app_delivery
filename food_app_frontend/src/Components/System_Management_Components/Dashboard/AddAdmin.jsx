import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideBar from "./SideBar";

const AddAdmin = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const navigate = useNavigate();

  // Function to get token from session storage or cookie
  const getAuthToken = () => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("authToken");
    console.log("Current token:", token); // Debug log
    return token;
  };

  useEffect(() => {
    const fetchRoles = async () => {
      const token = getAuthToken();
      
      if (!token) {
        console.error("No token found");
        setMessage("Authentication required. Please login again.");
        setMessageType("danger");
        // Optionally redirect to login
        // navigate('/login');
        return;
      }

      try {
        console.log("Making request with token:", token); // Debug log
        
        const response = await axios.get("/system_management/get_all_users/", {
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json",
            "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]')?.value
          },
          withCredentials: true // Important for sending cookies
        });

        console.log("Full API Response:", response); // Debug log

        if (response.data.status === 'success') {
          if (response.data.user_types) {
            console.log("Received roles:", response.data.user_types);
            setRoles(response.data.user_types);
          } else {
            console.warn("No user_types in response");
            setMessage("No roles available");
            setMessageType("warning");
          }
        } else {
          setMessage(response.data.message || "Failed to fetch roles");
          setMessageType("warning");
        }
      } catch (error) {
        console.error("Error details:", {
          message: error.message,
          response: error.response,
          request: error.request
        });
        
        if (error.response?.status === 401) {
          setMessage("Session expired. Please login again.");
          // navigate('/login');
        } else {
          setMessage(`Error: ${error.response?.data?.message || error.message}`);
        }
        setMessageType("danger");
      }
    };

    fetchRoles();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAuthToken();

    if (!token) {
      setMessage("Authentication required. Please login again.");
      setMessageType("danger");
      return;
    }

    try {
      const response = await axios.post(
        "/system_management/get_all_users/",
        {
          full_name: fullName,
          email,
          role,
        },
        {
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json",
            "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]')?.value
          },
          withCredentials: true
        }
      );

      if (response.data.status === 'success') {
        setMessage("Admin added successfully!");
        setMessageType("success");
        setTimeout(() => navigate("/admin/manage-admins"), 2000);
      } else {
        setMessage(response.data.message || "Failed to add admin");
        setMessageType("warning");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setMessage(error.response?.data?.message || "Error adding admin");
      setMessageType("danger");
    }
  };

  return (
    <div className="d-flex">
      <SideBar />
      <div className="content-area p-4">
        <h2 className="mb-4">Add Admin</h2>

        {message && (
          <div className={`alert alert-${messageType}`} role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-lg">
          <div className="mb-3">
            <label htmlFor="fullName" className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="role" className="form-label">Role</label>
            <select
              className="form-select"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              {Array.isArray(roles) && roles.map((role) => (
                <option key={role.id || role.name} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Add Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;