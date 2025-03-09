import React from 'react';
import '../styles/Navbar.css';
import logo from '../assets/YouConnect.png';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/">
        <img src={logo} alt="Logo" className="navbar-logo" />
      </Link>
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/" className="navbar-link">Home</Link>
        </li>
        <li className="navbar-item">
          <Link to="/contact" className="navbar-link">Contact</Link>
        </li>
        <li className="navbar-item">
          <Link to="/pricing" className="navbar-link">Pricing</Link>
        </li>
        <li className="navbar-item">
          <Link to="/whatsnew" className="navbar-link">What's New</Link>
        </li>
      </ul>
      <div className="navbar-buttons">
        <Link to="/getstarted" className="navbar-link">Sign in / Sign up</Link>
      </div>
    </nav>
  );
};

export default Navbar;

