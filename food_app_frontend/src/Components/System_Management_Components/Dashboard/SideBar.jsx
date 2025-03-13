import React from 'react';
import { Link } from "react-router-dom";

const SideBar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        {/* Logo or title here */}
      </div>
      <ul className="menu">
      <li>
        <a href="dashboard" className="menu-item">
            <box-icon name="home" color="#f04f23"></box-icon>
            <span>Dashboard</span>
        </a>
        </li>


        <li>
          Orders
        </li>
        <li>
          Customers
        </li>
        <li>
          Products
        </li>
        <li>
          {/* <a href="user_management">User Management</a> */}
          <Link to="/user_management">User Management</Link>

        </li>
        <li>
          {/* <a href="user_management">User Management</a> */}
          <Link to="/restaurent_management" >Restaurent Management</Link>

        </li>
        {/* Add more menu items as needed */}
      </ul>
    </div>
  );
};

export default SideBar;
