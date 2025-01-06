import express from 'express';
import multer from 'multer';
import storage from '../config/firebase.js';
import pool from '../config/db.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Route to handle video upload
router.post('/upload', upload.fields([{ name: 'video' }, { name: 'thumbnail' }]), async (req, res) => {
    try {
        const { title, description, tags, category, default_language, default_audio_language, privacy_status, workspace_id } = req.body;
        const videoFile = req.files['video'][0];
        const thumbnailFile = req.files['thumbnail'][0];

        if (!videoFile || !thumbnailFile) {
            return res.status(400).json({ message: 'Both video and thumbnail files are required.' });
        }

        const videoId = Date.now(); // Unique ID for the video
        const bucket = storage.bucket('youconnect-9671a.firebasestorage.app');

        // Upload video to Firebase Storage
        const videoPath = `videos/${workspace_id}/${videoId}/${videoFile.originalname}`;
        await bucket.file(videoPath).save(videoFile.buffer, { contentType: videoFile.mimetype });

        // Upload thumbnail to Firebase Storage
        const thumbnailPath = `videos/${workspace_id}/${videoId}/${thumbnailFile.originalname}`;
        await bucket.file(thumbnailPath).save(thumbnailFile.buffer, { contentType: thumbnailFile.mimetype });

        // Generate public URLs
        const videoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(videoPath)}?alt=media`;
        const thumbnailUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(thumbnailPath)}?alt=media`;

        // Insert metadata into PostgreSQL
        const query = `
            INSERT INTO videos (title, description, tags, category, default_language, default_audio_language, privacy_status, video_url, thumbnail_url, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending')
            RETURNING id
        `;
        const values = [title, description, tags ? tags.split(',') : [], category, default_language, default_audio_language, privacy_status, videoUrl, thumbnailUrl];
        const result = await pool.query(query, values);

        return res.status(201).json({ message: 'Video uploaded successfully.', videoId: result.rows[0].id });
    } catch (error) {
        console.error('Error uploading video:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

export default router;