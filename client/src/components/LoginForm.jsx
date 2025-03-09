import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate} from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import { AuthContext } from '../App';
import '../styles/LoginForm.css'

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState({ open: false, type: '', message: '' });
    const handleCloseAlert = () => setAlert({ ...alert, open: false });
    const { setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get('http://localhost:4000/auth/status', {
                    withCredentials: true, 
                });
                if(response.data.loggedIn) {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Error checking authentication status:', error);
            }
        };
        checkAuthStatus();
    }, [setIsAuthenticated]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/auth/login', { email, password }, {
                withCredentials: true,
            });

            setAlert({
                open: true,
                type: 'success',
                message: 'Login successful! Redirecting to your dashboard...',
            });

            setEmail('');
            setPassword('');
            setIsAuthenticated(true);

            setTimeout(() => {
                // Redirect based on the role
                if (response.data.role === 'youtuber') {
                    // window.location.href = response.data.redirectUrl;
                    navigate(response.data.redirectUrl);
                } else {
                    // window.location.href = response.data.redirectUrl;
                    navigate(response.data.redirectUrl);
                }
            }, 1000);

        } catch (error) {
            console.error('Error logging in:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Invalid email or password. Please try again.';
            setAlert({
                open: true,
                type: 'error',
                message: errorMessage,
            });
        }
    };

    return (
        <>
            <div className="login-form">
                <form onSubmit={handleSubmit}>
                    <h4>Login form</h4>
                    <div className="input-box">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='email' name="email" required />
                    </div>
                    <div className="input-box">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='password' name="password" required />
                    </div>
                    <Link to="/forgot-password">Forgot password</Link><br></br><br></br>
                    <button className='submit-button-login' type="submit">Login</button>
                </form>
            </div>
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
        </>
    );
};

export default LoginForm;
