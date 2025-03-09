import React, { useEffect, useState } from 'react';
import Navbar from './NavBar';
import Footer from './Footer';

const styles = {
    container: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100vh',
        backgroundColor: 'black',
        overflow: 'hidden',
    },
    blackHoleContainer: {
        marginTop: '150px',
        marginBottom: '100px',
        position: 'absolute'
    },
    blackHole: {
        width: '256px',
        height: '256px',
        borderRadius: '50%',
        backgroundColor: 'black'
    },
    textOverlay: {
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    comingSoonText: {
        color: 'white',
        fontSize: '24px',
        letterSpacing: '16px',
        marginBottom: '16px'
    },
    brandText: {
        color: '#5050ff',
        fontSize: '14px',
        letterSpacing: '8px'
    }
};

const WhatsNew = () => {
    const [glowIntensity, setGlowIntensity] = useState(0);

    useEffect(() => {
        // Animate the glow intensity
        const interval = setInterval(() => {
            setGlowIntensity(prev => {
                const newValue = prev + 0.01;
                return newValue > 1 ? 0 : newValue;
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    // Dynamic style for the glowing effect
    const blackHoleStyle = {
        ...styles.blackHole,
        boxShadow: `0 0 ${40 + glowIntensity * 20}px ${10 + glowIntensity * 15}px rgba(80, 80, 255, ${0.3 + glowIntensity * 0.2})`
    };

    return (
        <>
            <Navbar />
            <div style={styles.container}>
                {/* Black hole and glow effect */}
                <div style={styles.blackHoleContainer}>
                    <div style={blackHoleStyle} />
                </div>

                {/* Text overlay */}
                <div style={styles.textOverlay}>
                    <div style={styles.comingSoonText}>
                        C&nbsp;O&nbsp;M&nbsp;I&nbsp;N&nbsp;G&nbsp;&nbsp;S&nbsp;O&nbsp;O&nbsp;N
                    </div>
                    <div style={styles.brandText}>
                        Y O U C O N N E C T
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default WhatsNew;
