import React, { useState } from 'react';
import '../styles/Navbar.css';
import logo from '../assets/YouConnect.png';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Navbar Header - contains logo and hamburger */}
      <div className="navbar-header">
        <Link to="/" onClick={closeMenu}>
          <img src={logo} alt="Logo" className="navbar-logo" />
        </Link>
        
        {/* Hamburger Menu Button */}
        <div 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Desktop Menu Items (visible on desktop only) */}
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

      {/* Mobile Menu Container - pushes content down */}
      <div className={`mobile-menu-container ${isMenuOpen ? 'active' : ''}`}>
        <ul className="navbar-list">
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={closeMenu}>Home</Link>
          </li>
          <li className="navbar-item">
            <Link to="/contact" className="navbar-link" onClick={closeMenu}>Contact</Link>
          </li>
          <li className="navbar-item">
            <Link to="/pricing" className="navbar-link" onClick={closeMenu}>Pricing</Link>
          </li>
          <li className="navbar-item">
            <Link to="/whatsnew" className="navbar-link" onClick={closeMenu}>What's New</Link>
          </li>
        </ul>
        
        <div className="navbar-buttons">
          <Link to="/getstarted" className="navbar-link" onClick={closeMenu}>Sign in / Sign up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;