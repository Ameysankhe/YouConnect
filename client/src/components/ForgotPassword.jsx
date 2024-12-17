import { useState } from 'react';
import axios from 'axios';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/auth/forgot-password', { email });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response.data.message);
        }
    };

    return (
        <form onSubmit={handleForgotPassword}>
            <h1>Forgot Password</h1>
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
                name='email' 
                required 
            /><br /><br />
            <button type="submit">Send Reset Link</button>
            {message && <p>{message}</p>}
        </form>
    );
}

export default ForgotPassword;
