import express from 'express';
import multer from 'multer';
import storage from '../config/firebase.js';
import pool from '../config/db.js';
import { getAuthorizedClient } from '../config/youtubeAuth.js'; // Helper for OAuth authentication
import { google } from 'googleapis';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Route to handle video upload
router.post('/upload', upload.fields([{ name: 'video' }, { name: 'thumbnail' }]), async (req, res) => {
    try {
        const { title, description, tags, category, default_language, default_audio_language, privacy_status, workspace_id } = req.body;
        const videoFile = req.files['video'][0];
        const thumbnailFile = req.files['thumbnail'][0];

        // Validate required fields
        if (!title || !description || !tags || !category || !default_language || !default_audio_language || !privacy_status || !videoFile || !thumbnailFile) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const editor_id = req.user.id;

        // Fetch editor's name
        const editorQuery = 'SELECT username FROM users WHERE id = $1';
        const editorResult = await pool.query(editorQuery, [editor_id]);
        const editorName = editorResult.rows[0]?.username;

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
            INSERT INTO videos (title, description, tags, category, default_language, default_audio_language, privacy_status, video_url, thumbnail_url, status, workspace_id, editor_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', $10, $11)
            RETURNING id
        `;
        const values = [title, description, tags ? tags.split(',') : [], category, default_language, default_audio_language, privacy_status, videoUrl, thumbnailUrl, workspace_id, editor_id];
        const result = await pool.query(query, values);
        const uploadedVideoId = result.rows[0].id;

        // Send notification to the YouTuber

        // Fetch YouTuber (workspace owner) details
        const youtuberQuery = `
         SELECT u.id AS recipient_id, u.username AS recipient_name
         FROM workspaces w
         INNER JOIN users u ON w.owner_id = u.id
         WHERE w.id = $1
     `;
        const youtuberResult = await pool.query(youtuberQuery, [workspace_id]);
        const youtuber = youtuberResult.rows[0];

        if (!youtuber) {
            return res.status(404).json({ message: 'YouTuber not found for the specified workspace.' });
        }

        // Create notification message
        const message = `A new video titled "${title}" has been uploaded by ${editorName} for review.`;

        // Insert notification into PostgreSQL
        const notificationQuery = `
         INSERT INTO general_notifications (recipient_id, recipient_role, message, notification_type, related_workspace_id, related_entity_id, related_entity_type, expires_at)
         VALUES ($1, 'youtuber', $2, 'video_review', $3, $4, 'video', CURRENT_TIMESTAMP + INTERVAL '3 days')
     `;
        const notificationValues = [youtuber.recipient_id, message, workspace_id, uploadedVideoId];
        await pool.query(notificationQuery, notificationValues);

        return res.status(201).json({ message: 'Video uploaded successfully.', videoId: result.rows[0].id });
    } catch (error) {
        console.error('Error uploading video:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Route to approve video and upload to YouTube
router.post('/approve-video', async (req, res) => {
    try {
        const { videoId } = req.body;
        const { workspaceId } = req.body;

        if (!videoId || !workspaceId) {
            return res.status(400).json({ message: 'Video ID and Workspace ID are required.' });
        }

        // Fetch video metadata and editor_id from PostgreSQL
        const videoQuery = `SELECT * FROM videos WHERE id = $1 AND status = 'Pending'`;
        const videoResult = await pool.query(videoQuery, [videoId]);
        const video = videoResult.rows[0];

        if (!video) {
            return res.status(404).json({ message: 'Video not found or already processed.' });
        }

        const editorId = video.editor_id;

        // Fetch editor role from users table
        const userQuery = `SELECT role FROM users WHERE id = $1`;
        const userResult = await pool.query(userQuery, [editorId]);
        const user = userResult.rows[0];

        if (!user || user.role !== 'editor') {
            return res.status(404).json({ message: 'Editor not found or role mismatch.' });
        }

        // Firebase Storage paths
        const bucket = storage.bucket();        
        const videoFilePath = video.video_url.replace(`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/`, '').split('?')[0];
        const thumbnailFilePath = video.thumbnail_url.replace(`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/`, '').split('?')[0];

        // Avoid double encoding by using the file paths directly
        const videoFile = bucket.file(decodeURIComponent(videoFilePath));
        const thumbnailFile = bucket.file(decodeURIComponent(thumbnailFilePath));
   
        // Create read streams for video and thumbnail
        const videoStream = videoFile.createReadStream();
        const thumbnailStream = thumbnailFile.createReadStream();

        // console.log('Video Stream:', videoStream);
        // console.log('Thumbnail Stream:', thumbnailStream);


        // Authenticate YouTube API client
        const auth = await getAuthorizedClient(workspaceId); // Pass the workspace ID to fetch their OAuth token
        const youtube = google.youtube({ version: 'v3', auth });

        // Upload video to YouTube
        const uploadResponse = await youtube.videos.insert({
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title: video.title,
                    description: video.description,
                    tags: video.tags,
                    categoryId: video.category,
                    defaultLanguage: video.default_language,
                    defaultAudioLanguage: video.default_audio_language,
                },
                status: {
                    privacyStatus: video.privacy_status,
                },
            },
            media: {
                body: videoStream,
            },
        });

        const youtubeVideoId = uploadResponse.data.id;

        // Set the thumbnail
        await youtube.thumbnails.set({
            videoId: youtubeVideoId,
            media: {
                body: thumbnailStream,
            },
        });

        // Update video status in PostgreSQL
        const updateQuery = `UPDATE videos SET status = 'Approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1`;
        await pool.query(updateQuery, [videoId]);

        //Send notification to the editor
        const notificationMessage = `Your video "${video.title}" has been approved and uploaded to YouTube.`;
        const notificationQuery = `
            INSERT INTO general_notifications (
                recipient_id, recipient_role, message, notification_type, related_workspace_id, related_entity_id, related_entity_type, expires_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP + INTERVAL '3 days')
        `;
        await pool.query(notificationQuery, [
            editorId,
            user.role,
            notificationMessage,
            'review_response',
            workspaceId,
            videoId,
            'video',
        ]);


        return res.status(200).json({ message: 'Video approved and uploaded successfully.', youtubeVideoId });
    } catch (error) {
        console.error('Error approving and uploading video:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Route to reject video

export default router;