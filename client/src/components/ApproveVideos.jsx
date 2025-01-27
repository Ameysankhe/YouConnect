import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { Card, CardContent, Typography, Button, CardActions, IconButton, Dialog, DialogContent, CircularProgress} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const ApproveVideos = ({editorId}) => {
  const { id } = useParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
      const fetchVideos = async () => {
        try {
          const response = await axios.get(`http://localhost:4000/workspace/${id}/approve-videos`,{  params: { editorId }});
          setVideos(response.data);  
          setLoading(false);
        } catch (error) {
          console.error('Error fetching videos:', error);
        }
      };
  
      fetchVideos();
    }, [id, editorId]);

  const handleApprove = async (videoId) => {
    try {
      const response = await axios.post(`http://localhost:4000/api/approve-video`, {
        videoId,
        workspaceId: id, // Pass workspaceId explicitly
        // editorId: editorId  Pass editorId when approving
      });
      alert(response.data.message);
      setVideos(videos.filter((video) => video.id !== videoId));
    } catch (error) {
      console.error('Error approving video:', error);
      alert('Failed to approve video.');
    }
  };

  const handleReject = (videoId) => {
    alert(`Video with ID ${videoId} rejected.`);
    setVideos(videos.filter((video) => video.id !== videoId));
  };

  // const handleReject = async (videoId) => {
  //   try {
  //       const response = await axios.post(`http://localhost:4000/api/reject-video`, {
  //           videoId,
  //           workspaceId: id, // Pass workspaceId from useParams
  //       });
  //       alert(response.data.message);
  //       setVideos(videos.filter((video) => video.id !== videoId));
  //   } catch (error) {
  //       console.error('Error rejecting video:', error);
  //       alert('Failed to reject video.');
  //   }
  // };

  const handlePlay = (videoId) => {
    setPlayingVideoId(videoId);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPlayingVideoId(null);
    setIsPopupOpen(false);
  };

  if (loading) {
    return(
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
    </div>
    );
}

   if (videos.length === 0) {
          return <Typography>No videos for review.</Typography>;
    }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
      {videos.map((video) => (
        <Card key={video.id} style={{ width: '300px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={video.thumbnail_url}
              alt={video.title}
              style={{ width: '100%', height: '150px', objectFit: 'cover' }}
            />
            <IconButton
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '10px',
              }}
              onClick={() => handlePlay(video.id)}
            >
              <PlayArrowIcon />
            </IconButton>
          </div>
          <CardContent>
            <Typography variant="h6">{video.title}</Typography>
            <Typography variant="body2" color="textSecondary">
              {video.description}
            </Typography>
          </CardContent>
          <CardActions>
            <Button variant="contained" color="primary" onClick={() => handleApprove(video.id)}>
              Approve
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => handleReject(video.id)}>
              Reject
            </Button>
          </CardActions>
        </Card>
      ))}

      {/* Popup Video Player */}
      <Dialog open={isPopupOpen} onClose={handleClosePopup} maxWidth="md" fullWidth>
        <DialogContent style={{ padding: '0', position: 'relative' }}>
          <IconButton
            style={{ position: 'absolute', top: '10px', right: '10px', zIndex: '1' }}
            onClick={handleClosePopup}
          >
            <CloseIcon />
          </IconButton>
          {playingVideoId && (
            <div style={{ position: 'relative', paddingTop: '56.25%' /* 16:9 aspect ratio */, overflow: 'hidden' }}>
              <ReactPlayer
                url={videos.find((video) => video.id === playingVideoId).video_url}
                playing
                controls
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ApproveVideos;

