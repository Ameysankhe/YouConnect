import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/GetStartedButton.css"
const GetStartedButton = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/getstarted'); 
    };

    return (
        <button className='btn' onClick={handleGetStarted}>
            Get Started it's free
        </button>
    );
};

export default GetStartedButton;
