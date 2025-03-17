import React, { useState, useEffect } from "react";
import axios from "axios";
import SideBar from "../System_Management_Components/Dashboard/SideBar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

const fetchFoodItems = async (authToken) => {
  const response = await axios.get("http://localhost:8000/Restaurant_Management/get_all_food_items/", {
    headers: { Authorization: `Token ${authToken}` },
  });
  if (response.data?.status === "success") {
    return response.data.food_items || [];
  }
  throw new Error(response.data?.message || "Failed to fetch food items");
};

const deleteFoodItem = async (authToken, id, imageName) => {
  const response = await axios.delete(`http://localhost:8000/Restaurant_Management/delete_food_item/${id}/`, {
    headers: { Authorization: `Token ${authToken}` },
    data: { image_name: imageName }
  });
  if (response.data?.status === "success") {
    return true;
  }
  throw new Error(response.data?.message || "Failed to delete food item");
};

const FoodManagement = () => {
  const { authToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState(null);
  const foodItemsPerPage = 5;

  useEffect(() => {
    if (!authToken || !isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const data = await fetchFoodItems(authToken);
        setFoodItems(data);
      } catch (err) {
        console.error("[FoodManagement] Error:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken, isAuthenticated, navigate]);

  const handleDeleteFood = async (id, imageName) => {
    if (window.confirm("Are you sure you want to delete this food item?")) {
      try {
        setLoading(true);
        await deleteFoodItem(authToken, id, imageName);
        setFoodItems(foodItems.filter(item => item.id !== id));
        setMessage({ type: "success", text: "Food item deleted successfully" });
        setTimeout(() => setMessage(null), 3000);
      } catch (err) {
        setError(err.message || "Failed to delete food item");
        setMessage({ type: "danger", text: "Failed to delete food item" });
        setTimeout(() => setMessage(null), 3000);
      } finally {
        setLoading(false);
      }
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

  const indexOfLastFoodItem = currentPage * foodItemsPerPage;
  const indexOfFirstFoodItem = indexOfLastFoodItem - foodItemsPerPage;
  const currentFoodItems = foodItems.slice(indexOfFirstFoodItem, indexOfLastFoodItem);
  const totalPages = Math.ceil(foodItems.length / foodItemsPerPage);

  return (
    <div className="admin-management d-flex">
      <SideBar />
      <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
        <div className="center text mb-4">
          <h2 className="text-center">Manage Foods</h2>
          <Link to="/add_food" className="btn btn-primary">Add Food</Link>
        </div>

        {message && (
          <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
            {message.text}
            <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
          </div>
        )}

        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : !foodItems.length ? (
          <div className="alert alert-info">No food items found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>S.N</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Image</th>
                  <th>Featured</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentFoodItems.map((food, index) => (
                  <tr key={food.id}>
                    <td>{index + 1 + (currentPage - 1) * foodItemsPerPage}</td>
                    <td>{food.title}</td>
                    <td>${food.price}</td>
                    <td>
                      {food.image_url ? (
                        <img 
                          src={food.image_url} 
                          alt={food.title} 
                          style={{ width: '100px', height: 'auto' }} 
                        />
                      ) : (
                        <div className="text-danger">Image not added</div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${food.featured ? 'bg-success' : 'bg-secondary'}`}>
                        {food.featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${food.active ? 'bg-success' : 'bg-secondary'}`}>
                        {food.active ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/update-food/${food.id}`} className="btn btn-secondary btn-sm me-2">
                        Update Food
                      </Link>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteFood(food.id, food.image_name)}
                      >
                        Delete Food
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                  Previous
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default FoodManagement;