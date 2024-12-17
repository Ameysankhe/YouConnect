import React, { useState } from 'react';
import axios from 'axios';
import '../styles/RegistrationForm.css'

const RegistrationForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('editor');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/auth/register', {
                username,
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
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="editor">Editor</option>
                        <option value="youtuber">Youtuber</option>
                    </select><br /><br />
                    <button type="submit">Register</button>
                </form>
            </div>
        </>
    );
};

export default RegistrationForm;
