import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import SideBar from "../System_Management_Components/Dashboard/SideBar";

const backendApi = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
});

const AddFood = () => {
  const { authToken, csrfToken } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    image: null,
    category: "",
    featured: "Yes",
    active: "Yes",
  });
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await backendApi.get("/food_management/get_categories/", {
          headers: { Authorization: `Token ${authToken}` },
        });
        if (response.data.status === "success") {
          setCategories(response.data.categories || []);
        } else {
          setMessage("Failed to fetch categories");
          setMessageType("warning");
        }
      } catch (error) {
        setMessage("Error fetching categories");
        setMessageType("danger");
      }
    };
    fetchCategories();
  }, [authToken]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    try {
      const response = await backendApi.post("/food_management/add_food/", formDataToSend, {
        headers: {
          Authorization: `Token ${authToken}`,
          "X-CSRFToken": csrfToken,
        },
      });
      if (response.data.status === "success") {
        setMessage("Food added successfully!");
        setMessageType("success");
        setTimeout(() => navigate("/food_management"), 2000);
      } else {
        setMessage("Failed to add food");
        setMessageType("warning");
      }
    } catch (error) {
      setMessage("Error adding food");
      setMessageType("danger");
    }
  };

  return (
    <div className="admin-management d-flex">
      <SideBar />
      <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
        <h2 className="text-center mb-4">Add Food</h2>
        {message && <div className={`alert alert-${messageType}`} role="alert">{message}</div>}
        <form onSubmit={handleSubmit} className="max-w-lg">
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Price</label>
            <input
              type="number"
              className="form-control"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Image</label>
            <input
              type="file"
              className="form-control"
              name="image"
              onChange={handleFileChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Category</label>
            <select className="form-select" name="category" onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.title}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Featured</label>
            <div>
              <input type="radio" name="featured" value="Yes" checked={formData.featured === "Yes"} onChange={handleChange} /> Yes
              <input type="radio" name="featured" value="No" checked={formData.featured === "No"} onChange={handleChange} /> No
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Active</label>
            <div>
              <input type="radio" name="active" value="Yes" checked={formData.active === "Yes"} onChange={handleChange} /> Yes
              <input type="radio" name="active" value="No" checked={formData.active === "No"} onChange={handleChange} /> No
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Add Food</button>
        </form>
      </div>
    </div>
    // <div>
    //   <SideBar />
    //   <div className="content-area p-4">
    //     <h2>Add Food</h2>
    //     {message && <div className={`alert alert-${messageType}`}>{message}</div>}
    //     <form onSubmit={handleSubmit} className="max-w-lg">
    //       <input type="text" name="title" placeholder="Title" onChange={handleChange} required />
    //       <textarea name="description" placeholder="Description" onChange={handleChange} required />
    //       <input type="number" name="price" placeholder="Price" onChange={handleChange} required />
    //       <input type="file" name="image" onChange={handleFileChange} required />
    //       <select name="category" onChange={handleChange} required>
    //         <option value="">Select Category</option>
    //         {categories.map((cat) => (
    //           <option key={cat.id} value={cat.id}>{cat.title}</option>
    //         ))}
    //       </select>
    //       <label>
    //         Featured:
    //         <input type="radio" name="featured" value="Yes" checked={formData.featured === "Yes"} onChange={handleChange} /> Yes
    //         <input type="radio" name="featured" value="No" checked={formData.featured === "No"} onChange={handleChange} /> No
    //       </label>
    //       <label>
    //         Active:
    //         <input type="radio" name="active" value="Yes" checked={formData.active === "Yes"} onChange={handleChange} /> Yes
    //         <input type="radio" name="active" value="No" checked={formData.active === "No"} onChange={handleChange} /> No
    //       </label>
    //       <button type="submit">Add Food</button>
    //     </form>
    //   </div>
    // </div>
  );
};

export default AddFood;


// import { useState } from "react";

// export default function AddFood() {
//   const [foodName, setFoodName] = useState("");
//   const [price, setPrice] = useState("");
//   const [category, setCategory] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log({ foodName, price, category });
//     setFoodName("");
//     setPrice("");
//     setCategory("");
//   };

//   return (
//     <div className="wrapper">
//       <header className="header">
//         <h2>Add Food Item</h2>
//       </header>
//       <main className="main-content">
//         <div className="card-categories">
//           <div className="cat">
//             <form onSubmit={handleSubmit}>
//               <table className="tbl-full">
//                 <tbody>
//                   <tr>
//                     <td>Food Name:</td>
//                     <td>
//                       <input
//                         type="text"
//                         value={foodName}
//                         onChange={(e) => setFoodName(e.target.value)}
//                         required
//                       />
//                     </td>
//                   </tr>
//                   <tr>
//                     <td>Price:</td>
//                     <td>
//                       <input
//                         type="number"
//                         value={price}
//                         onChange={(e) => setPrice(e.target.value)}
//                         required
//                       />
//                     </td>
//                   </tr>
//                   <tr>
//                     <td>Category:</td>
//                     <td>
//                       <input
//                         type="text"
//                         value={category}
//                         onChange={(e) => setCategory(e.target.value)}
//                         required
//                       />
//                     </td>
//                   </tr>
//                   <tr>
//                     <td colSpan="2">
//                       <button type="submit" className="btn-primary">Add Food</button>
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </form>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

