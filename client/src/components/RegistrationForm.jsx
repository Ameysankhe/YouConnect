import React, { useState } from 'react';
import axios from 'axios';
import { Alert, Snackbar } from '@mui/material';
import '../styles/RegistrationForm.css';

const RegistrationForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('editor');
    const [alert, setAlert] = useState({ open: false, type: '', message: '' });

    const handleCloseAlert = () => setAlert({ ...alert, open: false });

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return passwordRegex.test(password);
    };

    const validateUsername = (username) => {
        return username.length >= 3 && username.length <= 20;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

         // Perform validations
         if (!validateUsername(username)) {
            setAlert({ open: true, type: 'error', message: 'Username must be between 3 and 20 characters long.' });
            return;
        }

        if (!validateEmail(email)) {
            setAlert({ open: true, type: 'error', message: 'Invalid email format.' });
            return;
        }

        if (!validatePassword(password)) {
            setAlert({
                open: true,
                type: 'error',
                message:
                    'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.',
            });
            return;
        }

        if (password !== confirmPassword) {
            setAlert({ open: true, type: 'error', message: 'Passwords do not match.' });
            return;
        }

        try {
            const response = await axios.post('http://localhost:4000/auth/register', {
                username,
                email,
                password,
                confirmPassword,
                role,
            });
            console.log('Registration successful:', response.data);
            // setAlert({ open: true, type: 'success', message: response.data.message });
            setAlert({ open: true, type: 'success', message: 'Your registration was successful!' });
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setRole('editor');
        } catch (error) {
            console.error('Error registering:', error);
            const errorMessage =
                error.response?.data?.message || 'An error occurred. Please try again.';
            setAlert({ open: true, type: 'error', message: errorMessage });
        }
    };

    return (
        <>
            <div className="registration-form">
                <form onSubmit={handleSubmit}>
                    <h1>Registration Form</h1>
                    <div className="input-box">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            name='username'
                            required
                        />
                    </div>
                    <div className="input-box">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" name='email' required /><br />
                    </div>
                    <div className="input-box">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" name='password' required />
                    </div>
                    <div className="input-box">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            required
                        />
                    </div>
                    <select className='dropdown-menu-registration' value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="editor">Editor</option>
                        <option value="youtuber">Youtuber</option>
                    </select><br /><br />
                    <button className='submit-button-registration' type="submit">Register</button>
                </form>
            </div>

            {/* Material-UI Alert */}
            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseAlert} severity={alert.type} sx={{
                    width: '100%', // Adjust width for larger messages
                    maxWidth: '600px', // Set a max width for proper formatting
                    wordWrap: 'break-word', // Ensure text wraps for long messages
                    fontSize: '1rem', // Adjust font size if needed
                    display: 'flex',
                    justifyContent: 'center', // Center-align content
                }}>
                    {alert.message}
                </Alert>
            </Snackbar>

        </>
    );
};

export default RegistrationForm;
