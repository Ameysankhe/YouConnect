import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  IconButton
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const VideoReview = ({ video, onBackToList }) => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category: '',
    defaultLanguage: '',
    defaultAudioLanguage: '',
    privacyStatus: ''
  });

  const [uploadProgress, setUploadProgress] = useState(65);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        tags: video.tags || '',
        category: video.category || '',
        defaultLanguage: video.default_language || '',
        defaultAudioLanguage: video.default_audio_language || '',
        privacyStatus: video.privacy_status || ''
      });
    }
  }, [video]);

  const handleApprove = async (videoId) => {
    try {
      setIsUploading(true);
      const response = await axios.post(`http://localhost:4000/api/approve-video`, {
        videoId,
        workspaceId: id, // Pass workspaceId explicitly
        // editorId: editorId  Pass editorId when approving
      });
      const confirmResult = window.confirm(response.data.message);
      if (confirmResult) {
        onBackToList();
      }
    } catch (error) {
      console.error('Error approving video:', error);
      alert('Failed to approve video.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReject = (videoId) => {
    if (!isUploading) {
      alert(`Video with ID ${videoId} rejected.`);
    }
  };

  // const handleReject = async (videoId) => {
  //   try {
  //       const response = await axios.post(`http://localhost:4000/api/reject-video`, {
  //           videoId,
  //           workspaceId: id, // Pass workspaceId from useParams
  // editorId: editorId  Pass editorId when approving
  //       });
  //       alert(response.data.message);
  //       setVideos(videos.filter((video) => video.id !== videoId));
  //   } catch (error) {
  //       console.error('Error rejecting video:', error);
  //       alert('Failed to reject video.');
  //   }
  // };

  const handlePlayVideo = () => {
    if (!isUploading) {
      setIsPlaying(true);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 3, p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Left Side - Form */}
      <Card sx={{ width: '33%', height: 'fit-content' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            multiline
            rows={4}
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            fullWidth
            label="Tags"
            name="tags"
            value={formData.tags}
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            fullWidth
            label="Category"
            name='category'
            value={formData.category}
            variant='outlined'
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            fullWidth
            label="Default Language"
            name='defaultLanguage'
            value={formData.defaultLanguage}
            variant='outlined'
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            fullWidth
            label="Default Audio Language"
            name='defaultAudioLanguage'
            value={formData.defaultAudioLanguage}
            variant='outlined'
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            fullWidth
            label="Privacy Status"
            name='privacyStatus'
            value={formData.privacyStatus}
            variant='outlined'
            InputProps={{
              readOnly: true,
            }}
          />
        </CardContent>
      </Card>

      {/* Right Side - Video Player and Controls */}
      <Box sx={{ width: '67%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Video Player */}
        <Card sx={{ aspectRatio: '16/9', bgcolor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {video && video.video_url ? (isPlaying ? (
            <ReactPlayer
              url={video.video_url}
              width="100%"
              height="100%"
              controls
              playing={!isUploading}
              onProgress={(progress) => {
                setPlayed(progress.played);
              }}
              onDuration={(duration) => {
                setDuration(duration);
              }}
            />
          ) : (
            <>
              <img
                src={video.thumbnail_url}
                alt="Video Thumbnail"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.7)'
                  }
                }}
                onClick={handlePlayVideo}
                disabled={isUploading}
              >
                <PlayArrowIcon fontSize="large" />
              </IconButton>
            </>
          )
        ) : (
           <Typography color="gray">No Video Available</Typography>
        )}
        </Card>

        {/* Progress Bar */}
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload Progress
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={() => handleApprove(video.id)}
              disabled={isUploading}
              sx={{ height: '48px',  opacity: isUploading ? 0.7 : 1 }}
            >
              Approve
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={() => handleReject(video.id)}
              disabled={isUploading}
              sx={{ height: '48px',  opacity: isUploading ? 0.7 : 1}}
            >
              Reject
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default VideoReview;