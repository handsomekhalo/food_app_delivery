
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import SideBar from "../System_Management_Components/Dashboard/SideBar";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../AuthContext";
// import UpdateManagerComponent from "./UpdateMnagerComponent";
// // import ViewCategoriesModal from "./ViewCategoriesModal";
// import ViewCategoriesModal from "../CategoryComponents/ViewCategories";


// const fetchRestaurants = async (authToken) => {
//   const response = await axios.get("http://localhost:8000/Restaurant_Management/get_all_restaurants/", {
//     headers: { Authorization: `Token ${authToken}` },
//   });
//   if (response.data?.status === "success") {
//     return response.data.restaurants || [];
//   }
//   throw new Error(response.data?.message || "Failed to fetch restaurants");
// };

// const Restaurent_management = () => {
//   const { authToken, isAuthenticated } = useAuth();
//   const navigate = useNavigate();
//   const [restaurants, setRestaurants] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedRestaurant, setSelectedRestaurant] = useState(null); // For selected restaurant
//   const [currentPage, setCurrentPage] = useState(1);
//   const restaurantsPerPage = 5;
//   // const [showCategoriesModal, setShowCategoriesModal] = useState(false);
//   const [categories, setCategories] = useState([]); // State for categories



//   useEffect(() => {
//     if (!authToken || !isAuthenticated) {
//       navigate("/login");
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         const data = await fetchRestaurants(authToken);
//         setRestaurants(data);
//       } catch (err) {
//         console.error("[Restaurent_management] Error:", err);
//         setError(err.message || "Failed to load data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [authToken, isAuthenticated, navigate]);

//   const view_categories = async (restaurantId) => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8000/Restaurant_Management/get_categories/${restaurantId}/`,
//         {
//           headers: { Authorization: `Token ${authToken}` },
//         }
//       );
//       if (response.data?.status === "success") {
//         setCategories(response.data.categories || []);
//         // setShowCategoriesModal(true);
//       } else {
//         console.error("Failed to fetch categories:", response.data?.message);
//       }
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   };
  
//   // Handle navigating to add category with restaurant ID
//   const handleAddCategory = (restaurantId) => {
//     console.log("Navigating to add category for restaurant ID:", restaurantId);
//     navigate(`/add_category`, { state: { restaurantId } });
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

//   const indexOfLastRestaurant = currentPage * restaurantsPerPage;
//   const indexOfFirstRestaurant = indexOfLastRestaurant - restaurantsPerPage;
//   const currentRestaurants = restaurants.slice(indexOfFirstRestaurant, indexOfLastRestaurant);
//   const totalPages = Math.ceil(restaurants.length / restaurantsPerPage);

//   return (
//     <div className="admin-management d-flex">
//       <SideBar />
//       <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
//         <div className="center text mb-4">
//           <h2 className="text-center">Restaurant Management</h2>
//           <Link to="/add-restaurant" className="btn btn-primary me-2">Add Restaurant</Link>
//         </div>

//         {error ? (
//           <div className="alert alert-danger">{error}</div>
//         ) : !restaurants.length ? (
//           <div className="alert alert-info">No restaurants found.</div>
//         ) : (
//           <div className="table-responsive">
//             <table className="table table-hover align-middle">
//               <thead className="table-light">
//                 <tr>
//                   <th>ID</th>
//                   <th>Name</th>
//                   <th>Address</th>
//                   <th>Manager</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentRestaurants.map((restaurant, index) => (
//                   <tr key={restaurant.id}>
//                     <td>{index + 1 + (currentPage - 1) * restaurantsPerPage}</td>
//                     <td>{restaurant.name}</td>
//                     <td>{restaurant.address}</td>
//                     <td>{restaurant.manager_name}</td>
//                     <td>
//                       <div className="btn-group">
//                         <button
//                           className="btn btn-primary btn-sm me-2"
//                           onClick={() => setSelectedRestaurant(restaurant)}
//                         >
//                           Update Manager
//                         </button>
//                         <button
//                           className="btn btn-success btn-sm me-2 "
//                           onClick={() => handleAddCategory(restaurant.id)}
//                         >
//                           Add Category
//                         </button>
//                         <button
//   className="btn btn-success btn-sm"
//   onClick={() => view_categories(restaurant.id)}
// >
//   View Categories
// </button>

//       {/* Modal for Viewing Categories */}
//       <ViewCategoriesModal
//         // show={showCategoriesModal}
//         handleClose={() => setShowCategoriesModal(false)}
//       />
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         <nav>
//           <ul className="pagination">
//             <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//               <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
//                 Previous
//               </button>
//             </li>
//             {[...Array(totalPages)].map((_, index) => (
//               <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
//                 <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
//                   {index + 1}
//                 </button>
//               </li>
//             ))}
//             <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
//               <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
//                 Next
//               </button>
//             </li>
//           </ul>
//         </nav>
//       </div>

//       {selectedRestaurant && (
//         <UpdateManagerComponent
//           restaurant={selectedRestaurant}
//           onClose={() => setSelectedRestaurant(null)}
//           onUpdate={(updatedRestaurant) => {
//             setRestaurants((prev) =>
//               prev.map((restaurant) =>
//                 restaurant.id === updatedRestaurant.id ? updatedRestaurant : restaurant
//               )
//             );
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Restaurent_management;

import React, { useState, useEffect } from "react";
import axios from "axios";
import SideBar from "../System_Management_Components/Dashboard/SideBar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import UpdateManagerComponent from "./UpdateMnagerComponent";
import ViewCategoriesModal from "../CategoryComponents/ViewCategories";

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
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const restaurantsPerPage = 5;
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [categories, setCategories] = useState([]);

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

  const handleAddCategory = (restaurantId) => {
    navigate(`/add_category`, { state: { restaurantId } });
  };

  // const view_categories = async (restaurantId) => {
  //   try {
  //     console.log('testing')
  //     const response = await axios.get(`http://localhost:8000/food_management/get_all_categories/`, {
  //       headers: { Authorization: `Token ${authToken}` },
  //     });

  //     if (response.data?.status === "success") {
  //       setCategories(response.data.categories || []);
  //       setShowCategoriesModal(true);
  //     } else {
  //       setCategories([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching categories:", error);
  //     setCategories([]);
  // //   }
  // // };
  // const view_categories = async (restaurantId) => {
  //   console.log('Fetching categories for restaurant ID:', restaurantId); // Debug log
  //   try {
  //     const response = await axios.get(`http://localhost:8000/food_management/get_all_categories/`, {
  //       headers: { Authorization: `Token ${authToken}` },
  //     });
  
  //     if (response.data?.status === "success") {
  //       setCategories(response.data.categories || []);
  //       setShowCategoriesModal(true);
  //       console.log('Categories fetched:', response.data.categories); // Debug log
  //     } else {
  //       setCategories([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching categories:", error);
  //     setCategories([]);
  //   }
  // };

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
          <Link to="/add-restaurant" className="btn btn-primary me-2">Add Restaurant</Link>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRestaurants.map((restaurant, index) => (
                  <tr key={restaurant.id}>
                    <td>{index + 1 + (currentPage - 1) * restaurantsPerPage}</td>
                    <td>{restaurant.name}</td>
                    <td>{restaurant.address}</td>
                    <td>{restaurant.manager_name}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-primary btn-sm me-2" onClick={() => setSelectedRestaurant(restaurant)}>
                          Update Manager
                        </button>
                        <button className="btn btn-success btn-sm me-2" onClick={() => handleAddCategory(restaurant.id)}>
                          Add Category
                        </button>
                        <button
  className="btn btn-success btn-sm"
  onClick={() => navigate("/view_categories", { state: { restaurantId: restaurant.id } })}
>
  View Categories
</button>

                      </div>
                    </td>
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
                <button className="page-link" onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      </div>

      {selectedRestaurant && (
        <UpdateManagerComponent
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          onUpdate={(updatedRestaurant) => {
            setRestaurants((prev) =>
              prev.map((restaurant) => (restaurant.id === updatedRestaurant.id ? updatedRestaurant : restaurant))
            );
          }}
        />
      )}

      <ViewCategoriesModal show={showCategoriesModal} handleClose={() => setShowCategoriesModal(false)} categories={categories} />
    </div>
  );
};

export default Restaurent_management;
