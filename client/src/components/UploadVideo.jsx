import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';
import { WebSocketContext } from '../context/WebSocketProvider';
import Swal from 'sweetalert2';

const CustomProgressBar = ({ progress }) => (
    <div style={{
        position: 'relative',
        width: '70%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    }}>
        <div style={{
            flex: 1,
            height: '4px',
            backgroundColor: '#edf2f7',
            borderRadius: '2px',
            overflow: 'hidden'
        }}>
            <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#3b82f6',
                transition: 'width 0.3s ease-in-out',
                borderRadius: '2px'
            }} />
        </div>
        <span style={{
            fontSize: '14px',
            color: '#64748b',
            minWidth: '45px'
        }}>
            {progress}%
        </span>
    </div>
);

const UploadVideo = () => {
    const { id: workspace_id } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        category: '',
        defaultLanguage: '',
        defaultAudioLanguage: '',
        privacyStatus: 'private',
    });

    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    // const [videoProgress, setVideoProgress] = useState(0);
    // const [thumbnailProgress, setThumbnailProgress] = useState(0);
    const [overallProgress, setOverallProgress] = useState(0);
    const [videoFileName, setVideoFileName] = useState('');
    const [thumbnailFileName, setThumbnailFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const socket = useContext(WebSocketContext);

    // Listen for real-time progress events from the server
    useEffect(() => {
        if (!socket) return;

        socket.on("videoUploadProgress", (data) => {
            // setVideoProgress(data.progress);
            console.log("Video upload progress:", data.progress);
        });

        socket.on("thumbnailUploadProgress", (data) => {
            // setThumbnailProgress(data.progress);
            console.log("Thumbnail upload progress:", data.progress);
        });

        socket.on("uploadStatus", (data) => {
            console.log("Overall upload status:", data);
            setOverallProgress(data.progress);
            if (data.progress === 100) {
                setTimeout(() => {
                    setIsUploading(false);
                }, 1000); // Small delay to ensure upload is completely finished
            }
        });

        return () => {
            socket.off("videoUploadProgress");
            socket.off("thumbnailUploadProgress");
            socket.off("uploadStatus");
        };
    }, [socket]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (e.target.name === 'video') {
            setVideoFile(file);
            setVideoFileName(file.name);
        }
        if (e.target.name === 'thumbnail') {
            setThumbnailFile(file);
            setThumbnailFileName(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check for empty required fields
        if (!formData.title.trim() ||
            !formData.description.trim() ||
            !formData.tags.trim() ||
            !formData.category ||
            !formData.defaultLanguage.trim() ||
            !formData.defaultAudioLanguage.trim() ||
            !videoFile ||
            !thumbnailFile
        ) {
            alert('All fields are required. Please fill out all fields.');
            return;
        }

        setIsUploading(true);

        const form = new FormData();
        form.append('title', formData.title);
        form.append('description', formData.description);
        form.append('tags', formData.tags);
        form.append('category', formData.category);
        form.append('default_language', formData.defaultLanguage);
        form.append('default_audio_language', formData.defaultAudioLanguage);
        form.append('privacy_status', formData.privacyStatus);
        form.append('video', videoFile);
        form.append('thumbnail', thumbnailFile);
        form.append('workspace_id', workspace_id);

        try {
            const response = await axios.post('http://localhost:4000/api/upload', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            // alert(response.data.message);
            // Show success SweetAlert
            Swal.fire({
                icon: 'success',
                title: 'Upload Successful!',
                text: response.data.message,
                backdrop: false,
                customClass: {
                    popup: 'my-custom-popup-class',
                    title: 'my-custom-title-class',
                    content: 'my-custom-content-class'
                }
            });
            // setVideoProgress(0);
            // setThumbnailProgress(0);
            setOverallProgress(0);
            setFormData({
                title: '',
                description: '',
                tags: '',
                category: '',
                defaultLanguage: '',
                defaultAudioLanguage: '',
                privacyStatus: 'private',
            });
            setVideoFile(null);
            setThumbnailFile(null);
            setVideoFileName('');
            setThumbnailFileName('');
            setIsUploading(false);
        } catch (error) {
            console.error('Error uploading video:', error);
            // alert('Failed to upload video.');
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
            setIsUploading(false); 
        }
    };

    const uploadSectionStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '20px'
    };

    return (
        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
            <Typography variant="h5">Upload a New Video</Typography>
            <Box sx={{ marginTop: 2 }}>
                {/* Title */}
                <TextField
                    name="title"
                    label="Title"
                    variant="outlined"
                    fullWidth
                    value={formData.title}
                    onChange={handleChange}
                    sx={{ marginBottom: 2 }}
                    disabled={isUploading}
                />

                {/* Description */}
                <TextField
                    name="description"
                    label="Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    sx={{ marginBottom: 2 }}
                    disabled={isUploading}
                />

                {/* Tags */}
                <TextField
                    name="tags"
                    label="Tags (comma-separated)"
                    variant="outlined"
                    fullWidth
                    value={formData.tags}
                    onChange={handleChange}
                    sx={{ marginBottom: 2 }}
                    disabled={isUploading}
                />

                {/* Category */}
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                        name='category'
                        labelId="category-label"
                        value={formData.category}
                        label="Category"
                        // defaultValue=""
                        onChange={handleChange}
                        disabled={isUploading}
                    >
                        <MenuItem value={24}>Entertainment</MenuItem>
                        <MenuItem value={27}>Education</MenuItem>
                        <MenuItem value={28}>Science & Technology</MenuItem>
                    </Select>
                </FormControl>

                {/* Default Language */}
                <TextField
                    name="defaultLanguage"
                    label="Default Language (ISO Code)"
                    variant="outlined"
                    fullWidth
                    value={formData.defaultLanguage}
                    onChange={handleChange}
                    sx={{ marginBottom: 2 }}
                    disabled={isUploading}
                />

                {/* Default Audio Language */}
                <TextField
                    name="defaultAudioLanguage"
                    label="Default Audio Language (ISO Code)"
                    variant="outlined"
                    fullWidth
                    value={formData.defaultAudioLanguage}
                    onChange={handleChange}
                    sx={{ marginBottom: 2 }}
                    disabled={isUploading}
                />

                {/* Privacy Status */}
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel id="privacy-label">Privacy Status</InputLabel>
                    <Select
                        name='privacyStatus'
                        labelId="privacy-label"
                        label="Privacy Status"
                        // defaultValue="private"
                        value={formData.privacyStatus}
                        onChange={handleChange}
                        disabled={isUploading}
                    >
                        <MenuItem value="private">Private</MenuItem>
                        <MenuItem value="public">Public</MenuItem>
                        <MenuItem value="unlisted">Unlisted</MenuItem>
                    </Select>
                </FormControl>

                {/* Video File */}
                <div style={uploadSectionStyle}>
                    <Button
                        variant="contained"
                        component="label"
                        sx={{ width: '200px' }}
                        disabled={isUploading}
                    >
                        Upload Video
                        <input type="file" hidden name='video' onChange={handleFileChange} disabled={isUploading} />
                    </Button>
                    {videoFileName && (
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" gutterBottom>
                                {videoFileName}
                            </Typography>
                            <CustomProgressBar progress={overallProgress} />
                        </Box>
                    )}
                </div>


                {/* Thumbnail File */}
                <div style={uploadSectionStyle}>
                    <Button
                        variant="contained"
                        component="label"
                        sx={{ width: '200px' }}
                        disabled={isUploading}>
                        Upload Thumbnail
                        <input type="file" hidden name='thumbnail' onChange={handleFileChange} disabled={isUploading}/>
                    </Button>
                    {thumbnailFileName && (
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" gutterBottom>
                                {thumbnailFileName}
                            </Typography>
                            <CustomProgressBar progress={overallProgress} />
                        </Box>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type='submit'
                    variant="contained"
                    sx={{ display: 'block' }}
                    disabled={isUploading}
                >
                     {isUploading ? 'Uploading...' : 'Submit'}
                </Button>
            </Box>
        </Box>
    );
};

export default UploadVideo;
