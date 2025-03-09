import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [alert, setAlert] = useState({ open: false, type: '', message: '' });
    const [searchParams] = useSearchParams(); // To retrieve the token from the URL
    const navigate = useNavigate();

    // Handle alert close
    const handleCloseAlert = () => setAlert({ ...alert, open: false });

    // Password validation function (without using a package)
    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return passwordRegex.test(password);
    };

    // Handle form submission
    const handleResetPassword = async (e) => {
        e.preventDefault();

        // Get token from URL
        const token = searchParams.get('token');
        if (!token) {
            setAlert({ open: true, type: 'error', message: 'Invalid or missing token' });
            return;
        }

        if (password !== confirmPassword) {
            setAlert({ open: true, type: 'error', message: 'Passwords do not match' });
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


        try {
            const response = await axios.post('http://localhost:4000/auth/reset-password', {
                token,
                password,
                confirmPassword
            });
            setPassword('');
            setConfirmPassword('');
            setAlert({ open: true, type: 'success', message: response.data.message });
            if (response.status === 200) {
                setTimeout(() => {
                    navigate('/'); // Redirect to login after successful reset
                }, 2000);
            }
        } catch (error) {
            setAlert({ open: true, type: 'error', message: error.response?.data?.message || 'An error occurred' });
        }
    };

    return (
        <div>
            <form onSubmit={handleResetPassword}>
                <h1>Reset Password</h1>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    required
                /><br /><br />
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                /><br /><br />
                <button type="submit">Reset Password</button><br /><br />
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
    );
}

export default ResetPassword;
