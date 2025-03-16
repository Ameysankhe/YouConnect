import React from 'react';
import logo from '../assets/YouConnect.png';
import '../styles/ResetNavbar.css';

const ResetNavbar = () => {
    return (
        <nav className="reset-navbar">
                  <img src={logo} alt="Logo" className="reset-navbar-logo" />
        </nav>
    );
};

export default ResetNavbar;