import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SideBar from "../System_Management_Components/Dashboard/SideBar";
import { useAuth } from "../../AuthContext";

const fetchCategories = async (authToken) => {
  const response = await axios.get("http://localhost:8000/category_management/get_all_categories/", {
    headers: { Authorization: `Token ${authToken}` },
  });
  if (response.data?.status === "success") {
    return response.data.categories || [];
  }
  throw new Error(response.data?.message || "Failed to fetch categories");
};

const deleteCategory = async (authToken, id, imageName) => {
  const response = await axios.delete(`http://localhost:8000/category_management/delete_category/`, {
    headers: { Authorization: `Token ${authToken}` },
    data: { image_name: imageName },
  });
  if (response.data?.status === "success") {
    return true;
  }
  throw new Error(response.data?.message || "Failed to delete category");
};

const CategoryManagement = () => {
  const { authToken, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!authToken || !isAuthenticated) {
      return;
    }

    const fetchData = async () => {
      try {
        const data = await fetchCategories(authToken);
        setCategories(data);
      } catch (err) {
        setMessage({ type: "danger", text: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authToken, isAuthenticated]);

  const handleDelete = async (id, imageName) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(authToken, id, imageName);
        setCategories(categories.filter((cat) => cat.id !== id));
        setMessage({ type: "success", text: "Category deleted successfully" });
      } catch (err) {
        setMessage({ type: "danger", text: err.message });
      }
    }
  };

  return (
    <div className="admin-management d-flex">
      <SideBar />
      <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
        <h2 className="text-center">Manage Categories</h2>
        <Link to="/add_category" className="btn btn-primary mb-3">Add Category</Link>

        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="alert alert-info">No categories found.</div>
        ) : (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>S.N</th>
                <th>Title</th>
                <th>Image</th>
                <th>Featured</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id}>
                  <td>{index + 1}</td>
                  <td>{category.title}</td>
                  <td>
                    {category.image_url ? (
                      <img src={category.image_url} alt={category.title} width="100" />
                    ) : (
                      <span className="text-danger">No Image</span>
                    )}
                  </td>
                  <td>{category.featured ? "Yes" : "No"}</td>
                  <td>{category.active ? "Yes" : "No"}</td>
                  <td>
                    <Link to={`/update-category/${category.id}`} className="btn btn-secondary btn-sm me-2">Update</Link>
                    <button onClick={() => handleDelete(category.id, category.image_name)} className="btn btn-danger btn-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
