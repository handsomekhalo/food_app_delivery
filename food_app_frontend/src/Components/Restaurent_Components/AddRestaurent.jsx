// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import SideBar from "./SideBar";
// import { useAuth } from "../../../AuthContext";


// const backendApi = axios.create({
//   baseURL: "http://127.0.0.1:8000",
//   withCredentials: true, // Ensures cookies are sent with requests
// });

// const AddAdmin = () => {
//   const { authToken, csrfToken } = useAuth();
  
//   const [formData, setFormData] = useState({
//     first_name: "",
//     last_name: "",
//     user_email: "",
//     user_type: ""
//   });
//   const [roles, setRoles] = useState([]);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("info");
//   const navigate = useNavigate();


//     // Fetch CSRF Token on Component Mount
//     useEffect(() => {
//       console.log("Fetching CSRF token...");
//       backendApi
//         .get("/system_management/csrf/", { withCredentials: true })
//         .then((response) => {
//           if (response.data && response.data.csrfToken) {
//             csrfToken(response.data.csrfToken);
//             console.log("CSRF Token Set:", response.data.csrfToken);
//           }
//         })
//         .catch((error) => {
//           console.error("CSRF Token Fetch Error:", error);
//         });
//     }, []);

//   // Function to fetch roles
  
//   const fetchRoles = async () => {
//     if (!authToken) {
//       setMessage("Authentication required. Please login again.");
//       setMessageType("danger");
//       return;
//     }

//     try {

      
//       const response = await axios.get(
//         "http://localhost:8000/system_management/get_roles/",
//         {
//           headers: {
//             Authorization: `Token ${authToken}`,
//             "Content-Type": "application/json",
//             "X-CSRFToken": csrfToken,
//           },
//           withCredentials: true,
//         }
//       );
      

//       if (response.data.status === "success") {
//         setRoles(response.data.roles || []);
//       } else {
//         setMessage(response.data.message || "Failed to fetch roles");
//         setMessageType("warning");
//       }
//     } catch (error) {
//       setMessage(`Error: ${error.response?.data?.message || error.message}`);
//       setMessageType("danger");
//     }
//   };

//   // Function to create a new user
//   const createUser = async () => {
//     if (!authToken) {
//       setMessage("Authentication required. Please login again.");
//       setMessageType("danger");
//       return;
//     }

//     try {

//       const response = await backendApi.post(
//         "/system_management/create_user/",
//           JSON.stringify(formData),  // Explicitly sending as JSON

//         {
//           headers: {
//             Authorization: `Token ${authToken}`,
//             "Content-Type": "application/json",  // Ensure JSON content type
//             "X-CSRFToken": csrfToken,
//           },
//           withCredentials: true,
//         }
        
//       );

//       // const response = await axios.post(
//       //   "http://localhost:8000/system_management/create_user/",
//       //   JSON.stringify(formData),  // Explicitly sending as JSON
//       //   {
//       //     headers: {
//       //       Authorization: `Token ${authToken}`,
//       //       "Content-Type": "application/json",  // Ensure JSON content type
//       //       "X-CSRFToken": csrfToken,
//       //     },
//       //     withCredentials: true,
//       //   }
//       // );
//       console.log('response',response)

//       if (response.data.status === "success") {
//         setMessage("User added successfully!");
//         setMessageType("success");
//         setTimeout(() => navigate("/user_management"), 2000);
//       } else {
//         setMessage(response.data.message || "Failed to add user");
//         setMessageType("warning");
//       }
//     } catch (error) {
//       // console.log('response',response)
//       setMessage(error.response?.data?.message || "Error adding user");
//       setMessageType("danger");
//     }
//   };

//   // Fetch roles on component mount
//   useEffect(() => {
//     fetchRoles();
//   }, []);

//   // Handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     createUser();
//   };

//   // Handle input changes
//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   return (
//     <div className="">
//       <SideBar />
//       <div className="content-area p-4">
//         <h2 className="mb-4">Add User</h2>

//         {message && (
//           <div className={`alert alert-${messageType}`} role="alert">
//             {message}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="max-w-lg">
//           <div className="mb-3">
//             <label htmlFor="first_name" className="form-label">First Name</label>
//             <input
//               type="text"
//               className="form-control"
//               id="first_name"
//               name="first_name"
//               value={formData.first_name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="mb-3">
//             <label htmlFor="last_name" className="form-label">Last Name</label>
//             <input
//               type="text"
//               className="form-control"
//               id="last_name"
//               name="last_name"
//               value={formData.last_name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="mb-3">
//             <label htmlFor="user_email" className="form-label">Email</label>
//             <input
//               type="email"
//               className="form-control"
//               id="user_email"
//               name="user_email"
//               value={formData.user_email}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="mb-3">
//             <label htmlFor="user_type" className="form-label">User Type</label>
//             <select
//               className="form-select"
//               id="user_type"
//               name="user_type"
//               value={formData.user_type}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Select User Type</option>
//               {roles.map((role) => (
//                 <option key={role.id} value={role.id}>
//                   {role.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <button type="submit" className="btn btn-primary dashboard-btn">
//             Add User
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddAdmin;
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
  const [roles, setRoles] = useState([]);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone_number: "",
    user_type: ""
  
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  
   // Fetch CSRF Token on Component Mount
   useEffect(() => {
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
  }, []);

  const fetchRoles = async () => {
    if (!authToken) {
      setMessage("Authentication required. Please login again.");
      setMessageType("danger");
      return;
    }

    try {

      
      const response = await axios.get(
        "http://localhost:8000/Restaurant_Management/get_restaurant_roles/",
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
        "/restaurants/create/",
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
          <div className={`alert alert-${messageType}`} role="alert">
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
            <input
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
          {/* <div className="mb-3">
            <label htmlFor="cuisine_type" className="form-label">Cuisine Type</label>
            <input
              type="text"
              className="form-control"
              id="cuisine_type"
              name="cuisine_type"
              value={formData.cuisine_type}
              onChange={handleChange}
              required
            />
          </div> */}
           <div className="mb-3">
                <label className="form-label">User Type</label>
                <select
                  className="form-select"
                  name="userType"
                //   value={formData.userType}
                //   onChange={handleInputChange}
                //   required
                >
                  <option value="">Select User Type</option>
                  {/* {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))} */}
                </select>
              </div>

          <button type="submit" className="btn btn-primary">Add Restaurant</button>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurant;