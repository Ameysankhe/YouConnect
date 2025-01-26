import React from 'react';
import Card from './Card';
import '../styles/CardGrid.css';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

const CardGrid = () => {
  const cardsData = [
    {
      icon: 'https://img.icons8.com/material-rounded/36/ffffff/youtube-play.png',
      title: 'YouTube Integration',
      description: 'Seamlessly integrate with YouTube channels to manage and publish videos directly from our platform.',
    },
    {
      icon: 'https://img.icons8.com/material-rounded/36/ffffff/video-editing.png',
      title: 'Editor Access',
      description: 'Grant video editors access to YouTuber workspaces for efficient collaboration. Editors can seamlessly finalize content.',
    },
    {
      icon: 'https://img.icons8.com/material-rounded/36/ffffff/notification-center.png',
      title: 'Approval Notifications',
      description: 'Notify YouTubers for content approval via WhatsApp or Slack for a streamlined process, making the workflow more efficient.',
    },
    {
      icon: <ManageAccountsIcon style={{ color: '#ffffff', fontSize: 36 }} />,
      title: 'Multi-Channel Management',
      description: 'Effortlessly manage multiple YouTube channels from a single unified platform, saving time and increasing efficiency.',
    },
    {
      icon: 'https://img.icons8.com/material-rounded/36/ffffff/security-checked.png',
      title: 'Two-Step Approval',
      description: 'Enhance security with a two-step approval process for content, ensuring all content undergoes thorough review.',
    },
    {
      icon: 'https://img.icons8.com/material-rounded/36/ffffff/administrator-male.png',
      title: 'YouTuber Control',
      description: 'Provide YouTubers with enhanced control over their content before uploading to YouTube servers.',
    },
  ];

  return (
    <div className="card-grid">
      {cardsData.map((card, index) => (
        <Card 
          key={index} 
          icon={card.icon} 
          title={card.title} 
          description={card.description} 
        />
      ))}
    </div>
  );
};

export default CardGrid;