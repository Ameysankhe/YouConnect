import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/LoginForm.css'

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get('http://localhost:4000/auth/status', {
                    withCredentials: true, // Include cookies with the request
                });
            } catch (error) {
                console.error('Error checking authentication status:', error);
            }
        };

        checkAuthStatus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/auth/login', { email, password }, {
                withCredentials: true,
            });

            // Redirect based on the role
            if (response.data.role === 'youtuber') {
                window.location.href = response.data.redirectUrl;
            } else {
                window.location.href = response.data.redirectUrl;
            }

        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    return (
        <>
            <div className="login-form">
                <form onSubmit={handleSubmit}>
                    <h1>Login form</h1>
                    <div className="input-box">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='email' name="email" required />
                    </div>
                    <div className="input-box">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='password' name="password" required />
                    </div>
                    <Link to="/forgot-password">Forgot password</Link><br></br><br></br>
                    <button type="submit">Login</button>
                </form>
            </div>
        </>
    );
};

export default LoginForm;
