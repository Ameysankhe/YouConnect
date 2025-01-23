import React from 'react';
import '../styles/Navbar.css';
import logo from '../assets/YouConnect.png'; 

const Navbar = () => {
  return (
    <nav className="navbar">
      <img src={logo} alt="Logo" className="navbar-logo" />
      <ul className="navbar-list">
        <li className="navbar-item">
          <a href="#home" className="navbar-link">Home</a>
        </li>
        <li className="navbar-item">
          <a href="#about" className="navbar-link">About Us</a>
        </li>
        <li className="navbar-item">
          <a href="#price" className="navbar-link">Pricing</a>
        </li>
        <li className="navbar-item">
          <a href="#contact" className="navbar-link">Contact</a>
        </li>
      </ul>
      <div className="navbar-buttons">
        <button className="navbar-button">Sign In or Sign Up</button>
      </div>
    </nav>
  );
};

export default Navbar;
