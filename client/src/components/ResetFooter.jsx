import React from 'react';
import '../styles/ResetFooter.css';

const ResetFooter = () => {
    return (
        <footer className="reset-footer">
            <div className="reset-footer-container">
                <p>&copy; {new Date().getFullYear()} YouConnect, Inc. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default ResetFooter;