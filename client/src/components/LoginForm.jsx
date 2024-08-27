import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/auth/login', { email, password });
            console.log(response.data);
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <h1>Login form</h1>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='email' required /><br /><br />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='password' required /><br /><br />
                <button type="submit">Login</button>
            </form>
        </>



    );
};

export default LoginForm;
