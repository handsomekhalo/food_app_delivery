import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import SideBar from "../System_Management_Components/Dashboard/SideBar";

const backendApi = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
});

const AddCategory = () => {
  const { authToken, csrfToken } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    image: null,
    featured: "Yes",
    active: "Yes",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

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
      const response = await backendApi.post("/food_management/add_category/", formDataToSend, {
        headers: {
          Authorization: `Token ${authToken}`,
          "X-CSRFToken": csrfToken,
        },
      });
      if (response.data.status === "success") {
        setMessage("Category added successfully!");
        setMessageType("success");
        setTimeout(() => navigate("/food_management"), 2000);
      } else {
        setMessage("Failed to add category");
        setMessageType("warning");
      }
    } catch (error) {
      setMessage("Error adding category");
      setMessageType("danger");
    }
  };

  return (
    <div className="admin-management d-flex">
      <SideBar />
      <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
        <h2 className="text-center mb-4">Add Category</h2>
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
          <button type="submit" className="btn btn-primary">Add Category</button>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
