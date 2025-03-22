// import React, { useState,useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../AuthContext";
// import SideBar from "../System_Management_Components/Dashboard/SideBar";

// const backendApi = axios.create({
//   baseURL: "http://127.0.0.1:8000",
//   withCredentials: true,
// });

// const AddCategory = () => {
//   const { authToken, csrfToken } = useAuth();
//   const navigate = useNavigate();


//   const [formData, setFormData] = useState({
//     title: "",
//     image: null,
//     featured: "Yes",
//     active: "Yes",
//   });
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("info");


  
//   useEffect(() => {
//     // Fetch CSRF token
//     console.log("Fetching CSRF token...");

//     backendApi
//       .get("/system_management/csrf/", { withCredentials: true })
//       .then((response) => {
//         if (response.data && response.data.csrfToken) {
//           csrfToken(response.data.csrfToken);
//           console.log("CSRF Token Set:", response.data.csrfToken);
//         }
//       })
//       .catch((error) => {
//         console.error("CSRF Token Fetch Error:", error);
//       });
//   }, []);
  
  
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleFileChange = (e) => {
//     setFormData({ ...formData, image: e.target.files[0] });
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   const formDataToSend = new FormData();
//   //   Object.entries(formData).forEach(([key, value]) => {
//   //     formDataToSend.append(key, value);
//   //   });
//   //   try {
//   //     const response = await backendApi.post("/food_management/create_category/",formDataToSend, {
//   //       headers: {
//   //         Authorization: `Token ${authToken}`,
//   //         "X-CSRFToken": csrfToken,
//   //       },
//   //     });
//   //     if (response.data.status === "success") {
//   //       setMessage("Category added successfully!");
//   //       setMessageType("success");
//   //       setTimeout(() => navigate("/food_management"), 2000);
//   //     } else {
//   //       setMessage("Failed to add category");
//   //       setMessageType("warning");
//   //     }
//   //   } catch (error) {
//   //     setMessage("Error adding category");
//   //     setMessageType("danger");
//   //   }
//   // };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formDataToSend = new FormData();
    
//     Object.entries(formData).forEach(([key, value]) => {
//       formDataToSend.append(key, value);
//     });
  
//     try {
//       const response = await backendApi.post("/food_management/create_category/", formDataToSend, {
//         headers: {
//           Authorization: `Token ${authToken}`,
//           "X-CSRFToken": csrfToken,
//           "Content-Type": "multipart/form-data",  // Ensure correct content type
//         },
//       });
  
//       if (response.data.status === "success") {
//         setMessage("Category added successfully!");
//         setMessageType("success");
//         setTimeout(() => navigate("/food_management"), 2000);
//       } else {
//         setMessage("Failed to add category");
//         setMessageType("warning");
//       }
//     } catch (error) {
//       setMessage("Error adding category");
//       setMessageType("danger");
//     }
//   };
  
//   return (
//     <div className="admin-management d-flex">
//       <SideBar />
//       <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
//         <h2 className="text-center mb-4">Add Category</h2>
//         {message && <div className={`alert alert-${messageType}`} role="alert">{message}</div>}
//         <form onSubmit={handleSubmit} className="max-w-lg">
//           <div className="mb-3">
//             <label className="form-label">Title</label>
//             <input
//               type="text"
//               className="form-control"
//               name="title"
//               value={formData.title}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div className="mb-3">
//             <label className="form-label">Image</label>
//             <input
//               type="file"
//               className="form-control"
//               name="image"
//               onChange={handleFileChange}
     
//             />
//           </div>
//           <div className="mb-3">
//             <label className="form-label">Featured</label>
//             <div>
//               <input type="radio" name="featured" value="Yes" checked={formData.featured === "Yes"} onChange={handleChange} /> Yes
//               <input type="radio" name="featured" value="No" checked={formData.featured === "No"} onChange={handleChange} /> No
//             </div>
//           </div>
//           <div className="mb-3">
//             <label className="form-label">Active</label>
//             <div>
//               <input type="radio" name="active" value="Yes" checked={formData.active === "Yes"} onChange={handleChange} /> Yes
//               <input type="radio" name="active" value="No" checked={formData.active === "No"} onChange={handleChange} /> No
//             </div>
//           </div>
//           <button type="submit" className="btn btn-primary">Add Category</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddCategory;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import SideBar from "../System_Management_Components/Dashboard/SideBar";

const backendApi = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
});

const AddCategory = () => {
  const { authToken, csrfToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get restaurant ID from navigation state
  const restaurantId = location.state?.restaurantId;
  console.log('restaurantId', restaurantId)
  const [formData, setFormData] = useState({
    title: "",
    image: null,
    featured: "Yes",
    active: "Yes",
    restaurant: restaurantId || "", // Set restaurant ID from navigation state
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // If no restaurant ID was passed, fetch available restaurants (for admin users)
    if (!restaurantId) {
      
      setLoading(true);
      backendApi.get("/food_management/get_all_categories/", {
        headers: { Authorization: `Token ${authToken}` },
      })
      .then(response => {
        if (response.data?.status === "success") {
          setRestaurants(response.data.restaurants || []);
          // Set the first restaurant as default if available
          if (response.data.restaurants && response.data.restaurants.length > 0) {
            
            setFormData(prev => ({
              ...prev,
              restaurant: response.data.restaurants[0].id
            }));
          }
        }
      })
      .catch(error => {
        console.error("Error fetching restaurants:", error);
        setMessage("Failed to load restaurants");
        setMessageType("danger");
      })
      .finally(() => {
        setLoading(false);
      });
    }
    
    // Fetch CSRF token
    backendApi.get("/system_management/csrf/", { withCredentials: true })
      .then((response) => {
        if (response.data && response.data.csrfToken) {
          csrfToken(response.data.csrfToken);
        }
      })
      .catch((error) => {
        console.error("CSRF Token Fetch Error:", error);
      });
  }, [authToken, csrfToken, restaurantId]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.restaurant) {
      setMessage("Please select a restaurant");
      setMessageType("warning");
      return;
    }
    
    const formDataToSend = new FormData();

    
    // Add all form data to FormData object
    // Object.entries(formData).forEach(([key, value]) => {
    //   if (value !== null && value !== undefined) {
    //     formDataToSend.append(key, value);
    //   }
    // });
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formDataToSend.append(key, value);
      }
    });
    try {
     
      const response = await backendApi.post("/food_management/create_category/", formDataToSend, {
        headers: {
          Authorization: `Token ${authToken}`,
          "X-CSRFToken": csrfToken,
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log('check response', response)
      if (response.data.status === "success") {
        setMessage("Category added successfully!");
        setMessageType("success");
        setTimeout(() => navigate("/food_management"), 2000);
      } else {
        setMessage(response.data.message || "Failed to add category");
        setMessageType("warning");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      setMessage(error.response?.data?.message || "Error adding category");
      setMessageType("danger");
    }
  };
  
  if (loading) {
    return (
      <div className="admin-management d-flex">
        <SideBar />
        <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-management d-flex">
      <SideBar />
      <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
        <h2 className="text-center mb-4">Add Category</h2>
        {message && <div className={`alert alert-${messageType}`} role="alert">{message}</div>}
        <form onSubmit={handleSubmit} className="max-w-lg">
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Only show restaurant selection if restaurant ID wasn't passed */}
          {!restaurantId && restaurants.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Restaurant</label>
              <select
                className="form-select"
                name="restaurant"
                value={formData.restaurant}
                onChange={handleChange}
                required
              >
                <option value="">Select Restaurant</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="mb-3">
            <label className="form-label">Image</label>
            <input
              type="file"
              className="form-control"
              name="image"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Featured</label>
            <div className="form-check">
              <input 
                type="radio" 
                className="form-check-input" 
                id="featuredYes" 
                name="featured" 
                value="Yes" 
                checked={formData.featured === "Yes"} 
                onChange={handleChange} 
              />
              <label className="form-check-label" htmlFor="featuredYes">Yes</label>
            </div>
            <div className="form-check">
              <input 
                type="radio" 
                className="form-check-input" 
                id="featuredNo" 
                name="featured" 
                value="No" 
                checked={formData.featured === "No"} 
                onChange={handleChange} 
              />
              <label className="form-check-label" htmlFor="featuredNo">No</label>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Active</label>
            <div className="form-check">
              <input 
                type="radio" 
                className="form-check-input" 
                id="activeYes" 
                name="active" 
                value="Yes" 
                checked={formData.active === "Yes"} 
                onChange={handleChange} 
              />
              <label className="form-check-label" htmlFor="activeYes">Yes</label>
            </div>
            <div className="form-check">
              <input 
                type="radio" 
                className="form-check-input" 
                id="activeNo" 
                name="active" 
                value="No" 
                checked={formData.active === "No"} 
                onChange={handleChange} 
              />
              <label className="form-check-label" htmlFor="activeNo">No</label>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary">Add Category</button>
          <button 
            type="button" 
            className="btn btn-secondary ms-2" 
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;