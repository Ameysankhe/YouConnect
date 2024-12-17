import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams(); // To retrieve the token from the URL
    const navigate = useNavigate();

    // Handle form submission
    const handleResetPassword = async (e) => {
        e.preventDefault();

        // Get token from URL
        const token = searchParams.get('token');
        if (!token) {
            setMessage('Invalid or missing token');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post('http://localhost:4000/auth/reset-password', {
                token,
                password,
                confirmPassword
            });
            setMessage(response.data.message); // Success message from the server
            if (response.status === 200) {
                setTimeout(() => {
                    navigate('/'); // Redirect to login after successful reset
                }, 2000); 
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'An error occurred');
        }
    };

    return (
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
            {message && <p>{message}</p>} {/* Display success/error messages */}
        </form>
    );
}

export default ResetPassword;
