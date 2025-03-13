import React, { useState, useEffect } from "react";
import axios from "axios";
import SideBar from "../System_Management_Components/Dashboard/SideBar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

const fetchRestaurants = async (authToken) => {
  const response = await axios.get("http://localhost:8000/Restaurant_Management/get_all_restaurants/", {
    headers: { Authorization: `Token ${authToken}` },
  });
  if (response.data?.status === "success") {
    return response.data.restaurants || [];
  }
  throw new Error(response.data?.message || "Failed to fetch restaurants");
};

const Restaurent_management = () => {
  const { authToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const restaurantsPerPage = 5; // Number of restaurants per page

  useEffect(() => {
    if (!authToken || !isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const data = await fetchRestaurants(authToken);
        setRestaurants(data);
      } catch (err) {
        console.error("[Restaurent_management] Error:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const indexOfLastRestaurant = currentPage * restaurantsPerPage;
  const indexOfFirstRestaurant = indexOfLastRestaurant - restaurantsPerPage;
  const currentRestaurants = restaurants.slice(indexOfFirstRestaurant, indexOfLastRestaurant);
  const totalPages = Math.ceil(restaurants.length / restaurantsPerPage);

  return (
    <div className="admin-management d-flex">
      <SideBar />
      <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
        <div className="center text mb-4">
          <h2 className="text-center">Restaurant Management</h2>
          <Link to="/add-restaurant" className="btn btn-primary">Add Restaurant</Link>
        </div>

        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : !restaurants.length ? (
          <div className="alert alert-info">No restaurants found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Manager</th>
                </tr>
              </thead>
              <tbody>
                {currentRestaurants.map((restaurant, index) => (
                  <tr key={restaurant.id}>
                    <td>{index + 1 + (currentPage - 1) * restaurantsPerPage}</td>
                    <td>{restaurant.name}</td>
                    <td>{restaurant.address}</td>
                    <td>{restaurant.manager_name}</td> {/* Display manager name */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Restaurent_management;
