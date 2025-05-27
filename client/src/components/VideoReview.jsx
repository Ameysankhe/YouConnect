import React, { useState, useEffect, useContext } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import axios from 'axios';
import { WebSocketContext } from '../context/WebSocketProvider';
import { useParams,} from 'react-router-dom';
import Swal from 'sweetalert2';

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

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showAccessMessage, setShowAccessMessage] = useState(false);
  const socket = useContext(WebSocketContext);

  const darkTheme = {
    background: '#000000', //black
    paper: '#111111', // very dark grey
    primary: '#5050ff', // vibrant shade of blue
    text: '#FFFFFF', // white
    border: '#333333' // dark grey
  };

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

  useEffect(() => {
    if (!socket) return;
    socket.on('approveProgress', (data) => {
      console.log('Approval progress:', data);
      setUploadProgress(data.progress);
    });
    return () => {
      socket.off('approveProgress');
    };
  }, [socket]);

  const handleApprove = async (videoId) => {
    try {
      setIsUploading(true);
      const response = await axios.post(`http://localhost:4000/api/approve-video`, {
        videoId,
        workspaceId: id,
      });
      Swal.fire({
        icon: 'success',
        title: 'Upload Successful!',
        text: response.data.message,
        backdrop: false,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'my-custom-popup-class',
          title: 'my-custom-title-class',
          content: 'my-custom-content-class'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          onBackToList();
        }
      });
    } catch (error) {
      console.error('Error approving video:', error);
      // alert('Failed to approve video.');
      if (error.response && error.response.status === 403 &&
        error.response.data.message === 'Please grant access to your YouTube channel first.') {
        setShowAccessMessage(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: 'Failed to upload video. Please try again.',
          backdrop: false,
          customClass: {
            popup: 'my-custom-popup-class',
            title: 'my-custom-title-class',
            content: 'my-custom-content-class'
          }
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleReject = async (videoId) => {
    try {
      setIsUploading(true);
      const response = await axios.post('http://localhost:4000/api/reject-video', { videoId, workspaceId: id }, { withCredentials: true });
      Swal.fire({
        icon: 'success',
        title: 'Editor Notified Successfully',
        text: response.data.message,
        backdrop: false,
        confirmButtonText: 'OK'
      }).then(() => {
        setIsUploading(false);
        onBackToList();
      });
    } catch (error) {
      console.error('Error rejecting video:', error);
      Swal.fire({
        icon: 'error',
        title: 'Rejection Failed',
        text: 'Failed to reject video. Please try again.',
        backdrop: true,
        allowOutsideClick: false,
      }).then(() => setIsUploading(false));
    }
  };

  const handlePlayVideo = () => {
    if (!isUploading) {
      setIsPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setPlayed(0);
  };


  return (
    <Box sx={{ display: 'flex', gap: 3, p: 3, bgcolor: '#111111', border: `1px solid ${darkTheme.border}`, minHeight: '100vh' }}>

      {/* Modal Dialog for Access Message */}
      <Dialog
        open={showAccessMessage}
        onClose={() => setShowAccessMessage(false)}
      >
        <DialogTitle>
          Access Required
        </DialogTitle>
        <DialogContent>
          <Typography>
            Please grant access to your YouTube channel first.
          </Typography>
        </DialogContent>
        <DialogActions   sx={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <Button
            variant="contained"
            onClick={() => setShowAccessMessage(false)}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>

      {/* Left Side - Form */}
      <Card sx={{ width: '33%', height: 'fit-content', bgcolor: '#111111', border: `1px solid ${darkTheme.border}` }}>
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
            sx={{
              marginBottom: 2, '& .MuiOutlinedInput-root': {
                color: darkTheme.text, // This sets the input text color
                '& fieldset': {
                  borderColor: darkTheme.border,
                },
                '&:hover fieldset': {
                  borderColor: darkTheme.text,
                },
                '&.Mui-focused fieldset': {
                  borderColor: darkTheme.text,
                },
              },
              '& .MuiInputLabel-root': {
                color: darkTheme.text, // This sets the label color
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)', // This sets the placeholder color
                opacity: 1,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: darkTheme.text, // Color when focused and floating
              },
              '& .MuiInputLabel-shrink': {
                color: darkTheme.text, // Color when shrunk (floating)
              },
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
            sx={{
              marginBottom: 2, '& .MuiOutlinedInput-root': {
                color: darkTheme.text, // This sets the input text color
                '& fieldset': {
                  borderColor: darkTheme.border,
                },
                '&:hover fieldset': {
                  borderColor: darkTheme.text,
                },
                '&.Mui-focused fieldset': {
                  borderColor: darkTheme.text,
                },
              },
              '& .MuiInputLabel-root': {
                color: darkTheme.text, // This sets the label color
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)', // This sets the placeholder color
                opacity: 1,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: darkTheme.text, // Color when focused and floating
              },
              '& .MuiInputLabel-shrink': {
                color: darkTheme.text, // Color when shrunk (floating)
              },
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
            sx={{
              marginBottom: 2, '& .MuiOutlinedInput-root': {
                color: darkTheme.text, // This sets the input text color
                '& fieldset': {
                  borderColor: darkTheme.border,
                },
                '&:hover fieldset': {
                  borderColor: darkTheme.text,
                },
                '&.Mui-focused fieldset': {
                  borderColor: darkTheme.text,
                },
              },
              '& .MuiInputLabel-root': {
                color: darkTheme.text, // This sets the label color
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)', // This sets the placeholder color
                opacity: 1,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: darkTheme.text, // Color when focused and floating
              },
              '& .MuiInputLabel-shrink': {
                color: darkTheme.text, // Color when shrunk (floating)
              },
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
            sx={{
              marginBottom: 2, '& .MuiOutlinedInput-root': {
                color: darkTheme.text, // This sets the input text color
                '& fieldset': {
                  borderColor: darkTheme.border,
                },
                '&:hover fieldset': {
                  borderColor: darkTheme.text,
                },
                '&.Mui-focused fieldset': {
                  borderColor: darkTheme.text,
                },
              },
              '& .MuiInputLabel-root': {
                color: darkTheme.text, // This sets the label color
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)', // This sets the placeholder color
                opacity: 1,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: darkTheme.text, // Color when focused and floating
              },
              '& .MuiInputLabel-shrink': {
                color: darkTheme.text, // Color when shrunk (floating)
              },
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
            sx={{
              marginBottom: 2, '& .MuiOutlinedInput-root': {
                color: darkTheme.text, // This sets the input text color
                '& fieldset': {
                  borderColor: darkTheme.border,
                },
                '&:hover fieldset': {
                  borderColor: darkTheme.text,
                },
                '&.Mui-focused fieldset': {
                  borderColor: darkTheme.text,
                },
              },
              '& .MuiInputLabel-root': {
                color: darkTheme.text, // This sets the label color
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)', // This sets the placeholder color
                opacity: 1,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: darkTheme.text, // Color when focused and floating
              },
              '& .MuiInputLabel-shrink': {
                color: darkTheme.text, // Color when shrunk (floating)
              },
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
            sx={{
              marginBottom: 2, '& .MuiOutlinedInput-root': {
                color: darkTheme.text, // This sets the input text color
                '& fieldset': {
                  borderColor: darkTheme.border,
                },
                '&:hover fieldset': {
                  borderColor: darkTheme.text,
                },
                '&.Mui-focused fieldset': {
                  borderColor: darkTheme.text,
                },
              },
              '& .MuiInputLabel-root': {
                color: darkTheme.text, // This sets the label color
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)', // This sets the placeholder color
                opacity: 1,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: darkTheme.text, // Color when focused and floating
              },
              '& .MuiInputLabel-shrink': {
                color: darkTheme.text, // Color when shrunk (floating)
              },
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
            sx={{
              marginBottom: 2, '& .MuiOutlinedInput-root': {
                color: darkTheme.text, // This sets the input text color
                '& fieldset': {
                  borderColor: darkTheme.border,
                },
                '&:hover fieldset': {
                  borderColor: darkTheme.text,
                },
                '&.Mui-focused fieldset': {
                  borderColor: darkTheme.text,
                },
              },
              '& .MuiInputLabel-root': {
                color: darkTheme.text, // This sets the label color
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)', // This sets the placeholder color
                opacity: 1,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: darkTheme.text, // Color when focused and floating
              },
              '& .MuiInputLabel-shrink': {
                color: darkTheme.text, // Color when shrunk (floating)
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Right Side - Video Player and Controls */}
      <Box sx={{ width: '67%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Video Player */}
        <Card sx={{ aspectRatio: '16/9', bgcolor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', border: `1px solid ${darkTheme.border}` }}>
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
              onEnded={handleVideoEnd}  
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
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(30, 30, 40, 0.5)',  // Dark bluish-gray, semi-transparent
                    color: '#555555',                          // Darker gray than the current #888888
                    cursor: 'not-allowed'
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
          <CardContent sx={{ bgcolor: darkTheme.paper, border: `1px solid ${darkTheme.border}` }}>
            {/* <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload Progress
            </Typography> */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
              <Typography variant="body2" sx={{ color: darkTheme.text }} gutterBottom>
                Upload Progress
              </Typography>
              <Typography variant="body2" sx={{ color: darkTheme.text }} gutterBottom>
                {Math.round(uploadProgress)}%
              </Typography>
            </Box>
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
              sx={{
                height: '48px', opacity: isUploading ? 0.7 : 1, '&.Mui-disabled': {
                  backgroundColor: '#1A3320',   // Very dark green (muted version of success)
                  color: '#6C7C6C',             // Muted greenish-gray
                  boxShadow: 'none',
                  borderColor: '#2C4A2C'        // Slightly lighter border
                }
              }}
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
              sx={{
                height: '48px', opacity: isUploading ? 0.7 : 1, '&.Mui-disabled': {
                  backgroundColor: '#3A1A1A',   // Very dark red (muted version of error)
                  color: '#7C6C6C',             // Muted reddish-gray
                  boxShadow: 'none',
                  borderColor: '#4A2C2C'        // Slightly lighter border
                }
              }}
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