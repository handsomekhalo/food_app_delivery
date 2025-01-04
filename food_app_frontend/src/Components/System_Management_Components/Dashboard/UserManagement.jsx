import React, { useState, useEffect } from "react";
import axios from "axios";
import SideBar from "./SideBar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import UpdateUserModal from "./UpdateUserModal";

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

const updateUser = async (authToken, updatedUser) => {
  await axios.put(
    `http://localhost:8000/system_management/update_user/${updatedUser.id}/`,
    updatedUser,
    {
      headers: { Authorization: `Token ${authToken}` },
    }
  );
};

const UserManagement = () => {
  const { authToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

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

  const handleUpdateUser = async (updatedUser) => {
    try {
      await updateUser(authToken, updatedUser);
      setAdmins((prev) =>
        prev.map((admin) => (admin.id === updatedUser.id ? updatedUser : admin))
      );
    } catch (error) {
      console.error("Error updating user:", error);
      setError(error.message || "Failed to update user");
    }
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

  return (
    <div className="admin-management d-flex">
      <SideBar />
      <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>User Management</h2>
          <Link to="/add-admin" className="btn btn-primary">
            Add User
          </Link>
        </div>

        {error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : !admins.length ? (
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
                  <tr key={admin.id}>
                    <td>{index + 1}</td>
                    <td>{`${admin.first_name} ${admin.last_name}`}</td>
                    <td>{admin.email}</td>
                    <td>{admin.user_type__name}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedUser(admin)}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UpdateUserModal
        show={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        roles={roles}
        onUpdate={handleUpdateUser}
      />
    </div>
  );
};

export default UserManagement;
