import React, { useState } from 'react';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';
import Navbar from './NavBar';
import Footer from './Footer';
import '../styles/ForgotPassword.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [alert, setAlert] = useState({ open: false, type: '', message: '' });

    const handleCloseAlert = () => setAlert({ ...alert, open: false });

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/auth/forgot-password', { email });
            setAlert({
                open: true,
                type: 'success',
                message: response.data.message,
            });
            setEmail('');
        } catch (error) {
            setAlert({
                open: true,
                type: 'error',
                message: error.response?.data?.message || 'An error occurred. Please try again.'
            });
        }
    };

    return (
        <>
            <Navbar />
            <div className="forgot-password-container">
                <div className='forgot-password-form'>
                    <form onSubmit={handleForgotPassword}>
                        <h4>Forgot Password</h4>
                        <div className='forgot-password-input-box'>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                name='email'
                                required
                            />
                        </div>
                        <button className='forgot-password-submit-button' type="submit">Send Reset Link</button>
                    </form>
                    {/* Snackbar for alerts */}
                    <Snackbar
                        open={alert.open}
                        autoHideDuration={6000}
                        onClose={handleCloseAlert}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert
                            onClose={handleCloseAlert}
                            severity={alert.type}
                            sx={{
                                width: '100%',
                                maxWidth: '600px',
                                wordWrap: 'break-word',
                                fontSize: '1rem',
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            {alert.message}
                        </Alert>
                    </Snackbar>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ForgotPassword;
