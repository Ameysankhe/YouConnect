import React from 'react';
import '../styles/Home.css';
import Navbar from './NavBar';
import CardGrid from './CardGrid.jsx';
import Footer from './Footer.jsx';
import QuickTubeBanner from './QuickTubeBanner.jsx';
import ServicesSection from './ServiceSection.jsx';

const Home = () => {
    return (
        <>
        <Navbar />
        <div className="home-container">
            <QuickTubeBanner/>
            <ServicesSection />
            <CardGrid />
            <Footer /> 
        </div>
        </>
    );
};

export default Home;


