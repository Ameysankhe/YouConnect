import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, Typography, Button, CardActions, CircularProgress } from '@mui/material';
import axios from 'axios';
import VideoReview from './VideoReview';

const ApproveVideos = ({ editorId }) => {
  const { id } = useParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const truncateDescription = (description) => {
    return description.length > 50
      ? description.substring(0, 50) + '.....'
      : description;
  };
  // Add a key to reset the component when editorId changes
  const componentKey = `approve-videos-${editorId}`;
  
  const darkTheme = {
    background: '#000000', //black
    paper: '#111111', // very dark grey
    primary: '#5050ff', // vibrant shade of blue
    text: '#FFFFFF', // white
    border: '#333333' // dark grey
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/workspace/${id}/approve-videos`, { params: { editorId } });
      setVideos(response.data);
      setLoading(false);
      setIsReviewing(false);
      setSelectedVideo(null);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [id, editorId, refreshKey]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{color: darkTheme.primary}}/>
      </div>
    );
  }

  if (videos.length === 0) {
    return <Typography sx={{color: darkTheme.text}}>No videos for review.</Typography>;
  }

  const handleReview = (video) => {
    setSelectedVideo(video);
    setIsReviewing(true);
  };

  const handleBackToList = () => {
    setIsReviewing(false);
    setSelectedVideo(null);
    setRefreshKey(prevKey => prevKey + 1);
  };

  if (isReviewing && selectedVideo) {
    return (
      <div>
        <Button
          variant="outlined"
          onClick={handleBackToList}
          style={{ margin: '20px', border: `1px solid ${darkTheme.primary}`, color: darkTheme.primary }}
        >
          Back to Video List
        </Button>
        <VideoReview video={selectedVideo} onBackToList={handleBackToList} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px',  }}>
      {videos.map((video) => (
        <Card
          key={video.id}
          style={{
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            height: 'auto ', 
            border: `1px solid ${darkTheme.border}`,
            backgroundColor: darkTheme.paper,
          }}>
          <div style={{ position: 'relative' }}>
            <img
              src={video.thumbnail_url}
              alt={video.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderBottom: `1px solid ${darkTheme.border}` }}
            />
          </div>
          <CardContent style={{ flex: '1 0 auto' }}>
            <Typography variant="h6" sx={{color: darkTheme.text}}>{video.title}</Typography>
            <Typography variant="body2" sx={{color: darkTheme.text}}>
              {truncateDescription(video.description)}
            </Typography>
          </CardContent>
          <CardActions style={{ padding: '16px', marginTop: 'auto' }}>
            <Button variant="contained" sx={{bgcolor: darkTheme.primary}} onClick={() => handleReview(video)}>Review</Button>
          </CardActions>
        </Card>
      ))}
    </div>
  );
};

export default ApproveVideos;

