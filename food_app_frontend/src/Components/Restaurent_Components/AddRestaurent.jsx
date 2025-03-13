import React from 'react';
import SideBar from '../System_Management_Components/Dashboard/SideBar';
import { Link, useNavigate } from "react-router-dom";

export const AddRestaurent = () => {
  return (  
    <div className="admin-management d-flex">
      <SideBar />
      <div className="container-fluid p-4" style={{ marginLeft: "250px", flex: 1 }}>
        <div className="center text mb-4">
          <h2 className="text-center">Add Restaurent</h2>
          <Link to="/add-restaurent" className="btn btn-primary">Add Restaurant</Link>
        </div>

      
      </div>

    </div>
  );
};



export default AddRestaurent;