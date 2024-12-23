import React, { useState, useEffect } from "react";
import axios from "axios";
import SideBar from "./SideBar";
import { Link } from "react-router-dom";

const UserManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      const token = localStorage .getItem("authToken"); // Fetch token
      console.log("Fetched token from sessionStorage:", token);

      if (!token) {
        console.error("No token found. User may not be authenticated.");
        setError("You are not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("/system_management/get_all_users/", {
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Log the response for debugging
        console.log("Fetch Admins Response:", response.data);

        // Check if response has the expected structure
        if (response.data && response.data.status === "success") {
          const users = response.data.users || [];
          setAdmins(users);
        } else {
          setError("Failed to load user data: " + (response.data.message || "Unknown error"));
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load user data: " + (err.message || "Network error"));
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token"); // Fetch token for delete operation
    console.log("Fetched token for delete operation:", token);

    if (!token) {
      alert("You are not authenticated. Please log in.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await axios.delete(`/system_management/delete_user/${id}/`, {
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Log the response for debugging
        console.log("Delete User Response:", response.data);

        if (response.data && response.data.status === "success") {
          setAdmins((prev) => prev.filter((admin) => admin.id !== id));
        } else {
          throw new Error(response.data.message || "Failed to delete user");
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user: " + (err.message || "Unknown error"));
      }
    }
  };

  return (
    <div className="admin-management d-flex">
      <SideBar />
      <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>User Management</h2>
          <Link to="/add-admin" className="btn btn-primary">Add User</Link>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : !Array.isArray(admins) || admins.length === 0 ? (
          <div className="alert alert-info" role="alert">
            No users found.
          </div>
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
                {admins.map((admin, index) => (
                  <tr key={admin.id || index}>
                    <td>{index + 1}</td>
                    <td>{admin.full_name}</td>
                    <td>{admin.email}</td>
                    <td>{admin.role || admin.user_type}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <Link
                          to={`/update-password/${admin.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Change Password
                        </Link>
                        <Link
                          to={`/update-admin/${admin.id}`}
                          className="btn btn-secondary btn-sm ms-2"
                        >
                          Update
                        </Link>
                        <button
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() => handleDelete(admin.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
