import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../AuthContext";

const UpdateUserModal = React.memo(({ show, onClose, user, roles, onUpdate }) => {
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
    e.stopPropagation();

    if (isSubmitting) return; // Prevent multiple submissions

    setError("");
    setIsSubmitting(true);

    if (!csrfToken) {
      setError("CSRF token not found. Please refresh the page.");
      setIsSubmitting(false);
      return;
    }

    try {
      const requestData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        user_type_id: parseInt(formData.userType),
        user_id: parseInt(formData.userId)
      };

      // Call API directly to update_user_api endpoint instead of going through update_user first
      const axiosInstance = axios.create();
      const response = await axiosInstance({
        method: "post",
        url: `http://localhost:8000/system_management_api/update_user_api/`,

        // url: `http://localhost:8000/api/update_user_api/`, // Modified to call API endpoint directly
        data: requestData,
        headers: {
          "X-CSRFToken": csrfToken,
          "Content-Type": "application/json",
          Authorization: `Token ${authToken}`
        },
        withCredentials: true,
        validateStatus: (status) => status < 500
      });

      const responseData =
        typeof response.data === "string" ? JSON.parse(response.data) : response.data;

      if (responseData.status === "success") {
        // Create updated user object with new values
        const updatedUser = {
          ...user,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          user_type_id: parseInt(formData.userType)
        };
        
        // Notify parent component of the update
        onUpdate(updatedUser);
        onClose();
      } else {
        setError(responseData.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "An error occurred while updating user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.5)", display: "block" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Update User</h5> {/* Fixed typo: "Updates" to "Update" */}
            <button type="button" className="btn-close" onClick={handleModalClose}></button>
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
});

export default UpdateUserModal;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useAuth } from "../../../AuthContext";

// const UpdateUserModal = React.memo(({ show, onClose, user, roles, onUpdate }) => {
//   console.log('hahaha')

//   const { authToken, csrfToken } = useAuth();
//   const [formData, setFormData] = useState({
//     first_name: "",
//     last_name: "",
//     email: "",
//     userType: "",
//     userId: ""
//   });
//   const [error, setError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         first_name: user.first_name || "",
//         last_name: user.last_name || "",
//         email: user.email || "",
//         userType: user.user_type_id || "",
//         userId: user.id || ""
//       });
//     }
//   }, [user]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSaveChanges = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (isSubmitting) return; // Prevent multiple submissions

//     setError("");
//     setIsSubmitting(true);

//     if (!csrfToken) {
//       setError("CSRF token not found. Please refresh the page.");
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const requestData = {
//         first_name: formData.first_name,
//         last_name: formData.last_name,
//         email: formData.email,
//         user_type_id: parseInt(formData.userType),
//         user_id: parseInt(formData.userId)
//       };

//       const axiosInstance = axios.create();
//       const response = await axiosInstance({
//         method: "post", // Explicitly set method to lowercase 'post'
//         url: `http://localhost:8000/system_management/update_user/${formData.userId}/`,
//         data: requestData,
//         headers: {
//           "X-CSRFToken": csrfToken,
//           "Content-Type": "application/json",
//           Authorization: `Token ${authToken}`
//         },
//         withCredentials: true,
//         validateStatus: (status) => status < 500 // Accept all status codes less than 500
//       });

//       const responseData =
//         typeof response.data === "string" ? JSON.parse(response.data) : response.data;

//       if (responseData.status === "success") {
//         const updatedUser = {
//           ...user,
//           first_name: formData.first_name,
//           last_name: formData.last_name,
//           email: formData.email,
//           user_type_id: parseInt(formData.userType)
//         };
//         setTimeout(() => {
//           onUpdate(updatedUser);
//           onClose();
//         }, 0);
//       } else {
//         setError(responseData.message || "Update failed");
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//       setError(err.response?.data?.message || "An error occurred while updating user");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleModalClose = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     onClose();
//   };

//   if (!show) return null;

//   return (
//     <div
//       className="modal fade show"
//       role="dialog"
//       style={{ background: "rgba(0,0,0,0.5)", display: "block" }}
//       onClick={(e) => e.stopPropagation()}
//     >
//       <div className="modal-dialog modal-dialog-centered">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title">Updates User</h5>
//             <button type="button" className="btn-close" onClick={handleModalClose}></button>
//           </div>
//           <form onSubmit={handleSaveChanges}>
//             <div className="modal-body">
//               {error && <div className="alert alert-danger">{error}</div>}
//               <div className="mb-3">
//                 <label className="form-label">User Type</label>
//                 <select
//                   className="form-select"
//                   name="userType"
//                   value={formData.userType}
//                   onChange={handleInputChange}
//                   required
//                 >
//                   <option value="">Select User Type</option>
//                   {roles.map((role) => (
//                     <option key={role.id} value={role.id}>
//                       {role.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">First Name</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   name="first_name"
//                   value={formData.first_name}
//                   onChange={handleInputChange}
//                   required
//                   maxLength={250}
//                 />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">Last Name</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   name="last_name"
//                   value={formData.last_name}
//                   onChange={handleInputChange}
//                   required
//                   maxLength={250}
//                 />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">Email</label>
//                 <input
//                   type="email"
//                   className="form-control"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   required
//                   maxLength={250}
//                 />
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button
//                 type="submit"
//                 className="btn btn-primary"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? "Saving..." : "Save Changes"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// });

// export default UpdateUserModal;
