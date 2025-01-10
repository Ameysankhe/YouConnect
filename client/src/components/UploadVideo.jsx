import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';

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
    const [videoProgress, setVideoProgress] = useState(0);
    const [thumbnailProgress, setThumbnailProgress] = useState(0);
    const [videoFileName, setVideoFileName] = useState('');
    const [thumbnailFileName, setThumbnailFileName] = useState('');

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
        form.append('workspace_id', workspace_id); // Use dynamic workspace_id

        try {
            const response = await axios.post('http://localhost:4000/api/upload', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
                onUploadProgress: (progressEvent) => {
                    const totalLength = progressEvent.total;
                    if (totalLength) {
                        const progress = Math.round((progressEvent.loaded * 100) / totalLength);
                        setVideoProgress(progress);
                        setThumbnailProgress(progress);
                    }
                }
            });
            alert(response.data.message);
            setVideoProgress(0);
            setThumbnailProgress(0);
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
        } catch (error) {
            console.error('Error uploading video:', error);
            alert('Failed to upload video.');
        }
    };

    // Custom styles for upload sections
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
                    >
                        Upload Video
                        <input type="file" hidden name='video' onChange={handleFileChange} />
                    </Button>
                    {videoFileName && (
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" gutterBottom>
                                {videoFileName}
                            </Typography>
                            <CustomProgressBar progress={videoProgress} />
                        </Box>
                    )}
                </div>


                {/* Thumbnail File */}
                <div style={uploadSectionStyle}>
                    <Button
                        variant="contained"
                        component="label"
                        sx={{ width: '200px' }}
                    >
                        Upload Thumbnail
                        <input type="file" hidden name='thumbnail' onChange={handleFileChange} />
                    </Button>
                    {thumbnailFileName && (
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" gutterBottom>
                                {thumbnailFileName}
                            </Typography>
                            <CustomProgressBar progress={thumbnailProgress} />
                        </Box>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type='submit'
                    variant="contained"
                    sx={{ display: 'block' }}
                >
                    Submit
                </Button>
            </Box>
        </Box>
    );
};

export default UploadVideo;
