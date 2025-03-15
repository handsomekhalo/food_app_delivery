import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../AuthContext";

const UpdateManagerComponent = ({ restaurant, onClose, onUpdate }) => {
  const { authToken, csrfToken } = useAuth();
  const [managerName, setManagerName] = useState(restaurant.manager_name || "");
  const [restaurantName, setRestaurantName] = useState(restaurant.name || "");
  const [address, setAddress] = useState(restaurant.address || "");
  const [managerEmail, setManagerEmail] = useState(""); // Initialize as empty
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [managerId, setManagerId] = useState(restaurant.manager); // Store the manager ID

  // Debug logs for initial values
  useEffect(() => {

  }, []);

  useEffect(() => {
    const fetchManagerEmail = async () => {
      try {
        const axiosInstance = axios.create();
        const response = await axiosInstance({
          method: "post",
          url: "http://127.0.0.1:8000/Restaurant_Management_api/get_manager_email_api/",
          data: { manager_id: restaurant.manager },
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true
        });

        // Debugging: Log the response
        console.log("Fetched manager email response:", response.data);

        // Extract manager email and set it
        if (response.data.status === 'success' && response.data.manager_email) {
          setManagerEmail(response.data.manager_email); // Update manager email
          setManagerId(restaurant.manager); // Use the restaurant.manager directly
        } else {
          console.error("Email not found in response:", response.data);
        }

      } catch (error) {
        // Error handling...
        console.error("Error fetching manager email:", error);
      }
    };

    if (restaurant.manager) {
      fetchManagerEmail();
    }
  }, [restaurant.manager, authToken, csrfToken]);

  const handleUpdate = async () => {
    // Form validation
    if (!managerName || !restaurantName || !address || !managerEmail) {
      Swal.fire("Error", "Please fill in all the fields.", "error");
      return;
    }

    // CSRF token validation
    if (!csrfToken) {
      console.error("CSRF token is missing");
      Swal.fire("Error", "CSRF token not found. Please refresh the page.", "error");
      return;
    }

    console.log("Starting update request with CSRF token:", csrfToken);
    
    setLoading(true);
    try {
      // Create a new axios instance for this specific request
      const axiosInstance = axios.create();
      
      // Create request data
      const requestData = {
        manager_name: managerName,
        name: restaurantName,
        address: address,
        email: managerEmail, // Use the email from the input
        manager_id: managerId, // Use the updated manager_id here
        restaurant_id: restaurant.id // Include the restaurant ID
      };

      console.log("Making request to:", `http://localhost:8000/Restaurant_Management_api/update_manager_api/`);
      console.log("With payload:", requestData);

      const response = await axiosInstance({
        method: "post", 
        url: `http://localhost:8000/Restaurant_Management_api/update_manager_api/`, // No ID in URL
        data: requestData,
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          "Accept": "application/json"
        },
        withCredentials: true,
        validateStatus: (status) => status < 500
      });

      console.log("Update Response:", response);
      console.log("Update Response Data:", response.data);

      if (response.data.status === "success") {
        Swal.fire("Success", "Restaurant details updated successfully", "success");
        onUpdate({
          ...restaurant,
          manager_name: managerName,
          name: restaurantName,
          address: address,
          email: managerEmail,
        });
        onClose();
      } else {
        console.error("Update failed with data:", response.data);
        Swal.fire("Error", response.data.message || "Update failed", "error");
      }
    } catch (error) {
      console.error("Update error:", error);
      console.error("Error response:", error.response);
      console.error("Error request:", error.request);
      
      Swal.fire("Error", error.response?.data?.message || "Failed to update restaurant details. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Update Restaurant Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
              <label htmlFor="restaurant-name" className="form-label">
                Restaurant Name
              </label>
              <input
                type="text"
                id="restaurant-name"
                className="form-control"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="manager-name" className="form-label">
                Manager Name
              </label>
              <input
                type="text"
                id="manager-name"
                className="form-control"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="address" className="form-label">
                Address
              </label>
              <input
                type="text"
                id="address"
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="manager-email" className="form-label">
                Manager's Email Address
              </label>
              <input
                type="text"
                id="manager-email"
                className="form-control"
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)} // Allow input
              />
            </div>

          
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Restaurant"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateManagerComponent;