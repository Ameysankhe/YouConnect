import React from 'react';
import '../styles/Card.css';

const Card = ({ icon, title, description }) => {
  return (
    <div className="card">
      <div className="icon-container">
        {typeof icon === 'string' ? <img src={icon} alt={title} /> : icon}
      </div>
      <h3 className="title">{title}</h3>
      <p className="description">{description}</p>
    </div>
  );
};

export default Card;