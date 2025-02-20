import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardMedia, Grid, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedIcon from '@mui/icons-material/Verified';
import CancelIcon from '@mui/icons-material/Cancel';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

const ListVideos = () => {
    const { id } = useParams();
    const [videosList, setVideosList] = useState([]);
    const [loading, setLoading] = useState(true);
    // Function to truncate description
    const truncateDescription = (description) => {
        return description.length > 50 
            ? description.substring(0, 50) + '.....' 
            : description;
    };
    
    useEffect(() => {
        const fetchVideosList = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/workspace/${id}/listofvideos`, { withCredentials: true });
                setVideosList(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching list of videos:', error);
                setLoading(false);
            }
        };

        fetchVideosList();
    }, [id]);

    if (loading) {
        return(
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <CircularProgress />
        </div>
        );
    }

    if (videosList.length === 0) {
        return <Typography>No videos uploaded yet.</Typography>;
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ marginBottom: 2 }}>
                Video Collection
            </Typography>
            <Grid container spacing={2}>
                {/* Example static data */}
                {videosList.map((video) => (
                    <Grid item xs={12} sm={6} md={4} key={video.id}>
                        <Card>
                            <Box sx={{ position: 'relative' }}>
                                <CardMedia
                                    component="img"
                                    height="150"
                                    image={video.thumbnail_url}
                                    alt={`${video.title} thumbnail`}
                                />
                                {video.status === 'Rejected' && (
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            color: 'white',
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                )}
                            </Box>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Typography variant="h6">{video.title}</Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 1 }}>
                                    {truncateDescription(video.description)}
                                </Typography>
                                <div style={{ marginTop: 'auto', alignSelf: 'flex-end', display: 'flex', alignItems: 'center' }}>
                                    {/* Conditional Rendering for Icons */}
                                    {video.status === 'Pending' && (
                                        <>
                                            <AccessTimeIcon sx={{ color: 'orange', marginRight: 1 }} />
                                            <Typography
                                                variant="body2"
                                                sx={{ color: 'orange' }}
                                            >
                                                {video.status}
                                            </Typography>
                                        </>
                                    )}
                                    {video.status === 'Approved' && (
                                        <>
                                            <VerifiedIcon sx={{ color: 'success.main', marginRight: 1 }} />
                                            <Typography
                                                variant="body2"
                                                sx={{ color: 'success.main' }}
                                            >
                                                {video.status}
                                            </Typography>
                                        </>
                                    )}
                                    {video.status === 'Rejected' && (
                                        <>
                                            <CancelIcon sx={{ color: 'error.main', marginRight: 1 }} />
                                            <Typography
                                                variant="body2"
                                                sx={{ color: 'error.main' }}
                                            >
                                                {video.status}
                                            </Typography>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ListVideos;

