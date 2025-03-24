import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import SideBar from "../System_Management_Components/Dashboard/SideBar";

const ViewCategories = () => {
  const { authToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurantId } = location.state || {};

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState("");

  useEffect(() => {
    if (!restaurantId) {
      navigate("/restaurent_management");
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/food_management/get_all_categories/?restaurant_id=${restaurantId}`,
          {
            headers: { Authorization: `Token ${authToken}` },
          }
        );

        if (response.data?.status === "success") {
          setCategories(response.data.categories || []);
        } else {
          setError("Failed to fetch categories.");
        }
      } catch (error) {
        setError("Error fetching categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [restaurantId, authToken, navigate]);

  const handleUpdateClick = (category) => {
    setSelectedCategory(category);
    setUpdatedTitle(category.title);
    Swal.fire({
      title: "Update Category",
      input: "text",
      inputValue: category.title,
      showCancelButton: true,
      confirmButtonText: "Update",
      preConfirm: async (newTitle) => {
        try {
          await axios.put(
            `http://localhost:8000/food_management/update_category/${category.id}/`,
            { title: newTitle },
            { headers: { Authorization: `Token ${authToken}` } }
          );
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === category.id ? { ...cat, title: newTitle } : cat
            )
          );
          Swal.fire("Success", "Category updated successfully", "success");
        } catch (error) {
          Swal.fire("Error", "Failed to update category", "error");
        }
      },
    });
  };

  const handleDeleteClick = (category) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete the category "${category.title}"!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `http://localhost:8000/food_management/delete_category/${category.id}/`,
            { headers: { Authorization: `Token ${authToken}` } }
          );
          setCategories((prev) => prev.filter((cat) => cat.id !== category.id));
          Swal.fire("Deleted!", "Category has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error", "Failed to delete category", "error");
        }
      }
    });
  };

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="admin-management d-flex">
      <SideBar />
      <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
        <h2 className="text-center">Manage Categories</h2>
        <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
          Back
        </button>

        {categories.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr key={category.id}>
                    <td>{index + 1}</td>
                    <td>{category.title}</td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={() => handleUpdateClick(category)}
                        >
                          Update
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteClick(category)}
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
        ) : (
          <p>No categories found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewCategories;