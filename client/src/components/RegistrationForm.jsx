import React, { useState } from 'react';
import axios from 'axios';

const RegistrationForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('editor');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/auth/register', {
                email,
                password,
                role,
            });
            console.log('Registration successful:', response.data);
        } catch (error) {
            console.error('Error registering:', error);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <h1>Registration Form</h1>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required /><br /><br />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required /><br /><br />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="editor">Editor</option>
                    <option value="youtuber">Youtuber</option>
                </select><br /><br />
                <button type="submit">Register</button>
            </form>
        </>
    );
};

export default RegistrationForm;
