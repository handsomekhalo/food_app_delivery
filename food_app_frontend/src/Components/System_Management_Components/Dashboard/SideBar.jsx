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
          {/* User Management link styled with Bootstrap */}
          <Link to="/user_management" className="text-dark fw-bold d-block py-2">
            User Management
          </Link>
        </li>
        <li>
          <Link to="/restaurent_management" className="text-dark fw-bold d-block py-2">Restaurent Management</Link>
        </li>
        <li>
          <Link to="/food_management" className="text-dark fw-bold d-block py-2">Food Management</Link>
        </li>
        {/* <li>
          <Link to="/category_management" className="text-dark fw-bold d-block py-2">Category Management</Link>
        </li> */}
        {/* Add more menu items as needed */}
      </ul>
    </div>
  );
};

export default SideBar;
