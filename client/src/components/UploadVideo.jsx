import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.name === 'video') setVideoFile(e.target.files[0]);
        if (e.target.name === 'thumbnail') setThumbnailFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile || !thumbnailFile) {
            alert('Please upload both a video and a thumbnail.');
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
            });
            alert(response.data.message);
        } catch (error) {
            console.error('Error uploading video:', error);
            alert('Failed to upload video.');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
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
                <Button
                    variant="contained"
                    component="label"
                    sx={{ marginBottom: 2, marginRight: 2 }}
                >
                    Upload Video
                    <input type="file" hidden name='video' onChange={handleFileChange}/>
                </Button>
                
                {/* Thumbnail File */}
                <Button
                    variant="contained"
                    component="label"
                    sx={{ marginBottom: 2 }}
                >
                    Upload Thumbnail
                    <input type="file" hidden name='thumbnail' onChange={handleFileChange}/>
                </Button>
                
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
