import React from 'react';
import '../styles/Footer.css';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-main">
                <div className="footer-logo-section">
                    <h1 className="footer-logo">You<span className="highlight">Connect</span></h1>
                    <p className="tagline">Making the world a better place through constructing elegant hierarchies.</p>
                    <div className="social-icons">
                        <FacebookIcon />
                        <InstagramIcon />
                        <TwitterIcon />
                        <GitHubIcon />
                        <LanguageIcon />
                    </div>
                </div>
                
                <div className="footer-links-container">
                    <div className="footer-column">
                        <h3>SOLUTIONS</h3>
                        <ul>
                            <li>Marketing</li>
                            <li>Analytics</li>
                            <li>Commerce</li>
                            <li>Insights</li>
                        </ul>
                    </div>
                    
                    <div className="footer-column">
                        <h3>COMPANY</h3>
                        <ul>
                            <li>About</li>
                            <li>Blog</li>
                            <li>Jobs</li>
                            <li>Press</li>
                            <li>Partners</li>
                        </ul>
                    </div>
                    
                    <div className="footer-column">
                        <h3>LEGAL</h3>
                        <ul>
                            <li>Claim</li>
                            <li>Privacy</li>
                            <li>Terms</li>
                        </ul>
                    </div>
                    
                    <div className="footer-column">
                        <h3>CONTACT US</h3>
                        <ul>
                            <li>+91 9022150887</li>
                            <li>+91 9699407467</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} YouConnect, Inc. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;

