import React from 'react';
import { Box, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

const UploadVideo = () => {
    return (
        <Box>
            <Typography variant="h5">Upload a New Video</Typography>
            <Box sx={{ marginTop: 2 }}>
                {/* Title */}
                <TextField
                    label="Title"
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: 2 }}
                />
                
                {/* Description */}
                <TextField
                    label="Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    sx={{ marginBottom: 2 }}
                />
                
                {/* Tags */}
                <TextField
                    label="Tags (comma-separated)"
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: 2 }}
                />
                
                {/* Category */}
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                        labelId="category-label"
                        label="Category"
                        defaultValue=""
                    >
                        <MenuItem value={24}>Entertainment</MenuItem>
                        <MenuItem value={27}>Education</MenuItem>
                        <MenuItem value={28}>Science & Technology</MenuItem>
                    </Select>
                </FormControl>

                {/* Default Language */}
                <TextField
                    label="Default Language (ISO Code)"
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: 2 }}
                />

                {/* Default Audio Language */}
                <TextField
                    label="Default Audio Language (ISO Code)"
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: 2 }}
                />
                
                {/* Privacy Status */}
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel id="privacy-label">Privacy Status</InputLabel>
                    <Select
                        labelId="privacy-label"
                        label="Privacy Status"
                        defaultValue="private"
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
                    <input type="file" hidden />
                </Button>
                
                {/* Thumbnail File */}
                <Button
                    variant="contained"
                    component="label"
                    sx={{ marginBottom: 2 }}
                >
                    Upload Thumbnail
                    <input type="file" hidden />
                </Button>
                
                {/* Submit Button */}
                <Button
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
