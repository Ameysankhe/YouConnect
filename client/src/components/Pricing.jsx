import React, { useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import '../styles/Pricing.css';
import Navbar from './NavBar';
import Footer from './Footer';

const Pricing = () => {
    const [isYearly, setIsYearly] = useState(true);

    const pricingPlans = [
        {
            title: 'Basic',
            description: 'A plan that scales with your rapidly growing YouTube.',
            monthlyPrice: '₹249',
            yearlyPrice: '₹1988',
            features: [
                { text: 'Up to 2 Channels', available: true },
                { text: 'Up to 2 Editors', available: true },
                { text: 'Up to 50 Videos', available: true },
                { text: 'Normal Analytics', available: true },
                { text: '24-hour support response time', available: true },
                { text: 'No Multiple Editors for Single Channel', available: false },
                { text: 'No Priority Support', available: false },
                { text: 'No Custom Integration', available: false },
            ],
        },
        {
            title: 'Standard',
            description: 'A plan that scales with your rapidly growing YouTube.',
            monthlyPrice: '₹349',
            yearlyPrice: '₹3188',
            features: [
                { text: 'Up to 10 Channels', available: true },
                { text: 'Up to 10 Editors', available: true },
                { text: 'Up to 150 Videos', available: true },
                { text: 'Advance Analytics', available: true },
                { text: '1-hour support response time', available: true },
                { text: 'Priority support', available: true },
                { text: 'No Multiple Editors for Single Channel', available: false },
                { text: 'No Custom Integration', available: false },
            ],
        },
        {
            title: 'Premium',
            description: 'A plan for YouTubers with advanced requirements.',
            monthlyPrice: '₹599',
            yearlyPrice: '₹6188',
            features: [
                { text: 'Unlimited Channels', available: true },
                { text: 'Unlimited Editors', available: true },
                { text: 'Unlimited Videos', available: true },
                { text: 'Advance Analytics', available: true },
                { text: '30-minute support response time', available: true },
                { text: 'Priority support', available: true },
                { text: 'Dedicated account manager', available: true },
                { text: 'Custom integrations', available: true },
            ],
        },
    ];


    return (
        <>
            <Navbar />
            <div className="pricing-page">
                <h4>Pricing plans for teams of all sizes</h4>
                <p>
                    Choose an affordable plan that's packed with the best features for
                    engaging your audience and managing your YouTube channels efficiently.
                </p>
                <div className="toggle">
                    <button
                        className={!isYearly ? 'active' : ''}
                        onClick={() => setIsYearly(false)}
                    >
                        Monthly
                    </button>
                    <button
                        className={isYearly ? 'active' : ''}
                        onClick={() => setIsYearly(true)}
                    >
                        Yearly
                    </button>
                </div>
                <div className="pricing-cards">
                    {pricingPlans.map((plan, index) => (
                        <div key={index} className="pricing-card">
                            <h2>{plan.title}</h2>
                            <p>{plan.description}</p>
                            <h3>
                                {isYearly ? plan.yearlyPrice : plan.monthlyPrice} /{' '}
                                {isYearly ? 'yr' : 'mo'}
                            </h3>
                            <button className="buy-button">Buy {plan.title}</button>
                            <ul className="features">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className={feature.available ? 'available' : 'unavailable'}>
                                        {feature.available ?
                                            <CheckCircleIcon className="icon-available" /> :
                                            <CancelIcon className="icon-unavailable" />
                                        }
                                        {feature.available ?
                                            feature.text :
                                            <s>{feature.text}</s>
                                        }
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Pricing;