import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../styles/Home.css';

const Home = () => {
    const navigate = useNavigate(); 

    const handleGetStarted = () => {
        navigate('/getstarted'); 
    };

    return (
        <div className='container'>
            <div className='center'>
                <button onClick={handleGetStarted}>Get Started</button>
            </div>
        </div>
    );
};

export default Home;
