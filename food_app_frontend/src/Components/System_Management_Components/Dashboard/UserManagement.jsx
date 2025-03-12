// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import SideBar from "./SideBar";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../../AuthContext";
// import UpdateUserModal from "./UpdateUserModal";
// import DeleteUser from "./DeleteUser";

// const fetchUsers = async (authToken) => {
//   const response = await axios.get("http://localhost:8000/system_management/get_all_users/", {
//     headers: { Authorization: `Token ${authToken}` },
//   });
//   if (response.data?.status === "success") {
//     return response.data.users || [];
//   }
//   throw new Error(response.data?.message || "Failed to fetch users");
// };

// const fetchRoles = async (authToken) => {
//   const response = await axios.get("http://localhost:8000/system_management/get_roles/", {
//     headers: { Authorization: `Token ${authToken}` },
//   });
//   if (response.data?.status === "success") {
//     return response.data.roles || [];
//   }
//   throw new Error(response.data?.message || "Failed to fetch roles");
// };

// // Removed updateUser function as it's now handled in the modal component

// const UserManagement = () => {
//   const { authToken, isAuthenticated } = useAuth();
//   const navigate = useNavigate();
//   const [admins, setAdmins] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [usersPerPage] = useState(6); // Number of users per page

//   useEffect(() => {
//     if (!authToken || !isAuthenticated) {
//       navigate("/login");
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         const [users, roles] = await Promise.all([fetchUsers(authToken), fetchRoles(authToken)]);
//         setAdmins(users);
//         setRoles(roles);
//       } catch (err) {
//         console.error("[UserManagement] Error:", err);
//         setError(err.message || "Failed to load data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [authToken, isAuthenticated, navigate]);

//   const handleUpdateUser = (updatedUser) => {
//     try {
//       // Don't make an API call here - the modal already did that
//       // Just update the local state with the updated user data
//       setAdmins((prev) =>
//         prev.map((admin) => (admin.id === updatedUser.id ? updatedUser : admin))
//       );
//       // No need to explicitly set selectedUser to null here as onClose in the modal will handle it
//     } catch (error) {
//       console.error("Error updating user:", error);
//       setError("Failed to update user in the UI");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
//         <div className="spinner-border" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   // Pagination logic
//   const indexOfLastUser  = currentPage * usersPerPage;
//   const indexOfFirstUser  = indexOfLastUser  - usersPerPage;
//   const currentUsers = admins.slice(indexOfFirstUser , indexOfLastUser );
//   const totalPages = Math.ceil(admins.length / usersPerPage);

//   return (
//     <div className="admin-management d-flex">
//       <SideBar />
//       <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
//         {/* <div className="d-flex justify-content-between align-items-center mb-4"> */}
//         <div className="center text mb-4">
//           <h2 className="text-center">User Management</h2>
//           <Link to="/add-admin" className="btn btn-primary ">
//             Add User
//           </Link>
//         </div>

//         {error ? (
//           <div className="alert alert-danger" role="alert">
//             {error}
//           </div>
//         ) : !admins.length ? (
//           <div className="alert alert-info" role="alert">
//             No users found.
//           </div>
//         ) : (
//           <div className="table-responsive">
//             <table className="table table-hover align-middle">
//               <thead className="table-light">
//                 <tr>
//                   <th>S.N</th>
//                   <th>Full Name</th>
//                   <th>Email</th>
//                   <th>Role</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentUsers.map((admin, index) => (
//                   <tr key={admin.id}>
//                     <td>{index + 1 + (currentPage - 1) * usersPerPage}</td>
//                     <td>{`${admin.first_name} ${admin.last_name}`}</td>
//                     <td>{admin.email}</td>
//                     <td>{admin.user_type__name}</td>
//                     <td>
//                       <button
//                         className="btn btn-primary btn-sm"
//                         onClick={() => setSelectedUser (admin)}
//                       >
//                         Update
//                       </button>
//                       <DeleteUser
//                        userId={admin.id}
//                         onDelete={(id) =>
//                          setAdmins((prev) => prev.filter((user) => user.id !== id))
//                           }
//                         />
                      
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
           
//             </table>
//           </div>
//         )}

//          {/* Pagination Controls */}
//          <nav>
//           <ul className="pagination">
//             <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//               <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
//             </li>
//             {[...Array(totalPages)].map((_, index) => (
//               <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
//                 <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
//                   {index + 1}
//                 </button>
//               </li>
//             ))}
//             <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
//               <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
//             </li>
//           </ul>
//         </nav>
//       </div>


//       <UpdateUserModal
//         show={!!selectedUser}
//         onClose={() => setSelectedUser(null)}
//         user={selectedUser}
//         roles={roles}
//         onUpdate={handleUpdateUser}
//       />
//     </div>
//   );
// };

// export default UserManagement;
import React, { useState, useEffect } from "react";
import axios from "axios";
import SideBar from "./SideBar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import UpdateUserModal from "./UpdateUserModal";
import DeleteUser from "./DeleteUser";

const fetchUsers = async (authToken) => {
  const response = await axios.get("http://localhost:8000/system_management/get_all_users/", {
    headers: { Authorization: `Token ${authToken}` },
  });
  if (response.data?.status === "success") {
    return response.data.users || [];
  }
  throw new Error(response.data?.message || "Failed to fetch users");
};

const fetchRoles = async (authToken) => {
  const response = await axios.get("http://localhost:8000/system_management/get_roles/", {
    headers: { Authorization: `Token ${authToken}` },
  });
  if (response.data?.status === "success") {
    return response.data.roles || [];
  }
  throw new Error(response.data?.message || "Failed to fetch roles");
};

const UserManagement = () => {
  const { authToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6; // Number of users per page

  useEffect(() => {
    if (!authToken || !isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [users, roles] = await Promise.all([fetchUsers(authToken), fetchRoles(authToken)]);
        setAdmins(users);
        setRoles(roles);
      } catch (err) {
        console.error("[UserManagement] Error:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken, isAuthenticated, navigate]);

  const handleUpdateUser = (updatedUser) => {
    setAdmins((prev) => prev.map((admin) => (admin.id === updatedUser.id ? updatedUser : admin)));
  };

  const handleDeleteUser = (id) => {
    setAdmins((prev) => prev.filter((user) => user.id !== id));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  //   // Pagination logic

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = admins.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(admins.length / usersPerPage);

  return (
    <div className="admin-management d-flex">
      <SideBar />
      <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
        <div className="center text mb-4">
          <h2 className="text-center">User Management</h2>
          <Link to="/add-admin" className="btn btn-primary">Add User</Link>
        </div>

        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : !admins.length ? (
          <div className="alert alert-info">No users found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>S.N</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((admin, index) => (
                  <tr key={admin.id}>
                    <td>{index + 1 + (currentPage - 1) * usersPerPage}</td>
                    <td>{`${admin.first_name} ${admin.last_name}`}</td>
                    <td>{admin.email}</td>
                    <td>{admin.user_type__name}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => setSelectedUser(admin)}>Update</button>
                      <DeleteUser user_id={admin.id} onDelete={handleDeleteUser} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
         <nav>
           <ul className="pagination">
             <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
               <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      </div>

      <UpdateUserModal show={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser} roles={roles} onUpdate={handleUpdateUser} />
    </div>
  );
};

export default UserManagement;
