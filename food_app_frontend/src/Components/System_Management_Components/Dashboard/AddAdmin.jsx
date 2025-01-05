import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import { useAuth } from "../../../AuthContext";

const AddAdmin = () => {
  const { authToken, csrfToken } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    user_email: "",
    user_type: ""
  });
  const [roles, setRoles] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const navigate = useNavigate();

  // Function to fetch roles
  const fetchRoles = async () => {
    if (!authToken) {
      setMessage("Authentication required. Please login again.");
      setMessageType("danger");
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:8000/system_management/get_roles/",
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );
      

      if (response.data.status === "success") {
        setRoles(response.data.roles || []);
      } else {
        setMessage(response.data.message || "Failed to fetch roles");
        setMessageType("warning");
      }
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
      setMessageType("danger");
    }
  };

  // Function to create a new user
  const createUser = async () => {
    if (!authToken) {
      setMessage("Authentication required. Please login again.");
      setMessageType("danger");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/system_management/create_user/",
        JSON.stringify(formData),  // Explicitly sending as JSON
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",  // Ensure JSON content type
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );
      console.log('response',response)

      if (response.data.status === "success") {
        setMessage("User added successfully!");
        setMessageType("success");
        setTimeout(() => navigate("/user_management"), 2000);
      } else {
        setMessage(response.data.message || "Failed to add user");
        setMessageType("warning");
      }
    } catch (error) {
      // console.log('response',response)
      setMessage(error.response?.data?.message || "Error adding user");
      setMessageType("danger");
    }
  };

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    createUser();
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="d-flex">
      <SideBar />
      <div className="content-area p-4">
        <h2 className="mb-4">Add User</h2>

        {message && (
          <div className={`alert alert-${messageType}`} role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-lg">
          <div className="mb-3">
            <label htmlFor="first_name" className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="last_name" className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="user_email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="user_email"
              name="user_email"
              value={formData.user_email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="user_type" className="form-label">User Type</label>
            <select
              className="form-select"
              id="user_type"
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              required
            >
              <option value="">Select User Type</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Add User
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;
