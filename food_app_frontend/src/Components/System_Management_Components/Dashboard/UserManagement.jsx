import React, { useState, useEffect } from "react";
import axios from "axios";
import SideBar from "./SideBar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";

const UserManagement = () => {
  const { authToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[UserManagement] Auth state:', { authToken, isAuthenticated });
  
    if (!authToken || !isAuthenticated) {
      console.log('[UserManagement] No token or not authenticated, redirecting to login.');
      setLoading(false);
      navigate('/login');
      return;
    }
  
    const fetchAdmins = async () => {
      try {
        const response = await axios.get("/system_management/get_all_users/", {
          headers: {
            'Authorization': `Token ${authToken}`, // Ensure token format
            'Content-Type': 'application/json',
          },
        });
  
        console.log('[UserManagement] API Response:', response.data);
  
        if (response.data?.status === "success") {
          setAdmins(response.data.users || []);
        } else {
          throw new Error(response.data?.message || "Failed to fetch users");
        }
      } catch (err) {
        console.error('[UserManagement] Error:', err);
  
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError(err.message || "Failed to load users");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchAdmins();
  }, [authToken, isAuthenticated, navigate]);
  

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
          <Link to="/add-admin" className="btn btn-primary">Add User</Link>
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