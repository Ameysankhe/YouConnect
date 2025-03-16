import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardMedia, Grid, IconButton, Menu, MenuItem, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
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
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: '', severity: '' });
    const truncateDescription = (description) => {
        return description.length > 50
            ? description.substring(0, 50) + '.....'
            : description;
    };

    const darkTheme = {
        background: '#000000', //black
        paper: '#111111', // very dark grey
        primary: '#5050ff', // vibrant shade of blue
        text: '#FFFFFF', // white
        border: '#333333' // dark grey
    };

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

    useEffect(() => {
        fetchVideosList();
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: darkTheme.primary }} />
            </div>
        );
    }

    if (videosList.length === 0) {
        return <Typography>No videos uploaded yet.</Typography>;
    }

    const handleMenuOpen = (event, video) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedVideo(video);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedVideo(null);
    };

    const handleDeleteConfirmation = async () => {
        try {
            const response = await axios.delete(`http://localhost:4000/api/delete/${selectedVideo.id}`, { withCredentials: true });
            setAlert({ open: true, message: response.data.message, severity: 'success' });
            fetchVideosList();
        } catch (error) {
            console.error('Error deleting video:', error);
            setAlert({ open: true, message: 'Failed to delete video.', severity: 'error' });
        } finally {
            setOpenConfirm(false);
            setSelectedVideo(null);
        }
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ marginBottom: 2, color: darkTheme.text }}>
                Video Collection
            </Typography>
            <Grid container spacing={2}>
                {videosList.map((video) => (
                    <Grid item xs={12} sm={6} md={4} key={video.id}>
                        <Card sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            border: `1px solid ${darkTheme.border}`,
                        }}>
                            <Box sx={{
                                position: 'relative', paddingTop: '56.25%',
                                width: '100%'
                            }}>
                                <CardMedia
                                    component="img"
                                    image={video.thumbnail_url}
                                    alt={`${video.title} thumbnail`}
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderBottom: `1px solid ${darkTheme.border}`,
                                    }}
                                />
                                {video.status === 'Rejected' && (
                                    <IconButton
                                        onClick={(event) => handleMenuOpen(event, video)}
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
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, backgroundColor: darkTheme.paper }}>
                                <Typography variant="h6" sx={{ color: darkTheme.text }}>{video.title}</Typography>
                                <Typography variant="body2" sx={{ marginBottom: 1, color: darkTheme.text }}>
                                    {truncateDescription(video.description)}
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginTop: 'auto',
                                    alignSelf: 'flex-end'
                                }}>
                                    {video.status === 'Pending' && (
                                        <>
                                            <AccessTimeIcon sx={{ color: 'orange', marginRight: 1 }} />
                                            <Typography variant="body2" sx={{ color: 'orange' }}>
                                                {video.status}
                                            </Typography>
                                        </>
                                    )}
                                    {video.status === 'Approved' && (
                                        <>
                                            <VerifiedIcon sx={{ color: 'success.light', marginRight: 1 }} />
                                            <Typography variant="body2" sx={{ color: 'success.light' }}>
                                                {video.status}
                                            </Typography>
                                        </>
                                    )}
                                    {video.status === 'Rejected' && (
                                        <>
                                            <CancelIcon sx={{ color: 'error.main', marginRight: 1 }} />
                                            <Typography variant="body2" sx={{ color: 'error.main' }}>
                                                {video.status}
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => { setOpenConfirm(true); setMenuAnchorEl(null); }}>Delete</MenuItem>
            </Menu>
            <Dialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the video?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} color="primary">
                        No
                    </Button>
                    <Button onClick={handleDeleteConfirmation} color="error">
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={() => setAlert({ ...alert, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ListVideos;

