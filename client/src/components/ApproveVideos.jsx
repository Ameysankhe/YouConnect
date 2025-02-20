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
        <CircularProgress />
      </div>
    );
  }

  if (videos.length === 0) {
    return <Typography>No videos for review.</Typography>;
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
          style={{ margin: '20px' }}
        >
          Back to Video List
        </Button>
        <VideoReview video={selectedVideo} onBackToList={handleBackToList} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
      {videos.map((video) => (
        <Card
          key={video.id}
          style={{
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            height: 'auto ', 
          }}>
          <div style={{ position: 'relative' }}>
            <img
              src={video.thumbnail_url}
              alt={video.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
          </div>
          <CardContent style={{ flex: '1 0 auto' }}>
            <Typography variant="h6">{video.title}</Typography>
            <Typography variant="body2" color="textSecondary">
              {truncateDescription(video.description)}
            </Typography>
          </CardContent>
          <CardActions style={{ padding: '16px', marginTop: 'auto' }}>
            <Button variant="contained" color="primary" onClick={() => handleReview(video)}>Review</Button>
          </CardActions>
        </Card>
      ))}
    </div>
  );
};

export default ApproveVideos;

