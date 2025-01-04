import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../AuthContext";

const UpdateUserModal = ({ show, onClose, user, roles, onUpdate }) => {
  const { authToken, csrfToken } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    userType: "",
    userId: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        userType: user.user_type_id || "",
        userId: user.id || ""
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
  
    if (!csrfToken) {
      setError("CSRF token not found. Please refresh the page.");
      return;
    }
  
    try {
      const requestData = {
        first_name: formData.first_name, // Corrected
        last_name: formData.last_name,   // Corrected
        email: formData.email,
        user_type_id: parseInt(formData.userType),
        user_id: parseInt(formData.userId),
        password: user.password || "" // Optional
      };
      
      // const requestData = {
      //   first_name: formData.firstName,
      //   last_name: formData.lastName,
      //   email: formData.email,
      //   user_type_id: parseInt(formData.userType),
      //   user_id: parseInt(formData.userId),
      //   password: user.password || "" // Include the existing password if available
      // };
  
      const response = await axios.post(
        'http://localhost:8000/system_management/update_user/',
        // requestData,
        JSON.stringify(requestData),
        {
          headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
            Authorization: `Token ${authToken}`,
          },
          withCredentials: true,
        }
      );

      console.log('response is',response)
  
      const responseData = typeof response.data === 'string' 
        ? JSON.parse(response.data) 
        : response.data;
  
      if (responseData.status === 'success') {
        const updatedUser = {
          ...user,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          user_type_id: parseInt(formData.userType)
        };
        onUpdate(updatedUser);
        onClose();
      } else {
        setError(responseData.message || 'Update failed');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'An error occurred while updating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.5)", display: "block" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Update User</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSaveChanges}>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label className="form-label">User Type</label>
                <select
                  className="form-select"
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
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
              <div className="mb-3">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  maxLength={250}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  maxLength={250}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  maxLength={250}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateUserModal;
