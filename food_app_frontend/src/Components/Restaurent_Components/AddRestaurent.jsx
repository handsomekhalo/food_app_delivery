// export default AddRestaurant;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideBar from "../System_Management_Components/Dashboard/SideBar";
import { useAuth } from "../../AuthContext";

const backendApi = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true, // Ensures cookies are sent with requests
});

const AddRestaurant = () => {
  const { authToken, csrfToken } = useAuth();
  const [managers, setManagers] = useState([]); // Stores restaurant managers

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone_number: "",
    user_type: "" // Ensure user_type is selected
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

//   // Fetch Restaurant Managers
//   useEffect(() => {
//     const fetchManagers = async () => {
//       if (!authToken) {
//         setMessage("Authentication required. Please login again.");
//         setMessageType("danger");
//         return;
//       }

//       try {
//         const response = await axios.get(
//           "http://127.0.0.1:8000/Restaurant_Management/get_all_restaurant_managers/",
//           {
//             headers: {
//               Authorization: `Token ${authToken}`,
//               "Content-Type": "application/json",
//               "X-CSRFToken": csrfToken,
//             },
//             withCredentials: true,
//           }
//         );

//         if (response.data.status === "success") {
//           setManagers(response.data.restaurant_managers || []);
//         } else {
//           setMessage(response.data.message || "Failed to fetch managers");
//           setMessageType("warning");
//         }
//       } catch (error) {
//         setMessage(`Error: ${error.response?.data?.message || error.message}`);
//         setMessageType("danger");
//       }
//     };

//     fetchManagers();
//   }, [authToken, csrfToken]);

//The first useEffect will fetch the CSRF token and store it in the csrfToken state.
//Once the CSRF token is set, the second part fetches the list of restaurant managers using the authToken and csrfToken.

useEffect(() => {
    // Fetch CSRF token
    console.log("Fetching CSRF token...");
    backendApi
      .get("/system_management/csrf/", { withCredentials: true })
      .then((response) => {
        if (response.data && response.data.csrfToken) {
          csrfToken(response.data.csrfToken);
          console.log("CSRF Token Set:", response.data.csrfToken);
        }
      })
      .catch((error) => {
        console.error("CSRF Token Fetch Error:", error);
      });
  
    // Fetch Restaurant Managers
    const fetchManagers = async () => {
      if (!authToken) {
        setMessage("Authentication required. Please login again.");
        setMessageType("danger");
        return;
      }
  
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/Restaurant_Management/get_all_restaurant_managers/",
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
          setManagers(response.data.restaurant_managers || []);
        } else {
          setMessage(response.data.message || "Failed to fetch managers");
          setMessageType("warning");
        }
      } catch (error) {
        setMessage(`Error: ${error.response?.data?.message || error.message}`);
        setMessageType("danger");
      }
    };
  
    fetchManagers();
  }, [authToken, csrfToken]);
  

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      setMessage("Authentication required. Please login again.");
      setMessageType("danger");
      return;
    }
    try {
      const response = await backendApi.post(
        "/Restaurant_Management/create_restaurant/",
        JSON.stringify(formData),
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
        }
      );
      if (response.data.status === "success") {
        setMessage("Restaurant added successfully!");
        setMessageType("success");
        setTimeout(() => navigate("/restaurants"), 2000);
      } else {
        setMessage(response.data.message || "Failed to add restaurant");
        setMessageType("warning");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error adding restaurant");
      setMessageType("danger");
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="admin-management d-flex">
      <SideBar />
      <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
        <h2 className="text-center mb-4">Add Restaurant</h2>
        {message && (
          <div className="alert alert-success" role="alert">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="max-w-lg">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Restaurant Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="address" className="form-label">Address</label>
            <textarea
              type="text"
              className="form-control"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="phone_number" className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-control"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Assign Manager</label>
            <select
              className="form-select"
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              required
            >
              <option value="">Select a Manager</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} - {manager.email}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary">Add Restaurant</button>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurant;
