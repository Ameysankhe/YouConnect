import React from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Button, Grid, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import thumbnail1 from '../assets/thumbnail-1.jpg';
import thumbnail2 from '../assets/thumbnail-2.jpg';
import thumbnail3 from '../assets/thumbnail-3.jpg'

const ListVideos = () => {
    return (
        <Box>
            <Typography variant="h5" sx={{ marginBottom: 2 }}>
                Video Collection
            </Typography>
            <Grid container spacing={2}>
                {/* Example static data */}
                {[
                    { title: 'Sample Title', description: 'Sample Description', status: 'Pending', thumbnail: thumbnail1 },
                    { title: 'Another Title', description: 'Another Description', status: 'Approved', thumbnail: thumbnail2 },
                    { title: 'Rejected Title', description: 'Rejected Description', status: 'Rejected', thumbnail: thumbnail3 },
                ].map((video, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                            <Box sx={{ position: 'relative' }}>
                                <CardMedia
                                    component="img"
                                    height="150"
                                    image={video.thumbnail}
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
                            <CardContent>
                                <Typography variant="h6">{video.title}</Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 1 }}>
                                    {video.description}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: video.status === 'Rejected' ? 'error.main' : video.status === 'Approved' ? 'success.main' : 'textSecondary',
                                    }}
                                >
                                    {video.status}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ListVideos;

