import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>About Us</h3>
                    <p>
                        We are committed to providing the best content and services for our users.
                    </p>
                </div>
                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <ul>
                        {/* <li><a href="#" onClick={(e) => e.preventDefault()}>Home</a></li>
                        <li><a href="#" onClick={(e) => e.preventDefault()}>About</a></li>
                        <li><a href="#" onClick={(e) => e.preventDefault()}>Services</a></li>
                        <li><a href="#" onClick={(e) => e.preventDefault()}>Contact</a></li> */}
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Follow Us</h3>
                    {/* <div className="social-icons">
                        <a href="#" onClick={(e) => e.preventDefault()} aria-label="Facebook">
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="#" onClick={(e) => e.preventDefault()} aria-label="Twitter">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="#" onClick={(e) => e.preventDefault()} aria-label="Instagram">
                            <i className="fab fa-instagram"></i>
                        </a>
                    </div> */}
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} YouConnect All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
