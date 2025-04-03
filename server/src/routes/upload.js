import express from 'express';
import multer from 'multer';
import storage from '../config/firebase.js';
import pool from '../config/db.js';
import { getAuthorizedClient } from '../config/youtubeAuth.js'; // Helper for OAuth authentication
import { google } from 'googleapis';
import { Readable } from 'stream';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });
const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_VIDEO_SIZE = 256 * 1024 * 1024 * 1024; // 256GB
const VALID_ISO_CODES = [
    'aa', 'ab', 'ae', 'af', 'ak', 'am', 'an', 'ar', 'as', 'av', 'ay', 'az',
    'ba', 'be', 'bg', 'bh', 'bi', 'bm', 'bn', 'bo', 'br', 'bs', 'ca', 'ce',
    'ch', 'co', 'cr', 'cs', 'cu', 'cv', 'cy', 'da', 'de', 'dv', 'dz', 'ee',
    'el', 'en', 'eo', 'es', 'et', 'eu', 'fa', 'ff', 'fi', 'fj', 'fo', 'fr',
    'fy', 'ga', 'gd', 'gl', 'gn', 'gu', 'gv', 'ha', 'he', 'hi', 'ho', 'hr',
    'ht', 'hu', 'hy', 'hz', 'ia', 'id', 'ie', 'ig', 'ii', 'ik', 'io', 'is',
    'it', 'iu', 'ja', 'jv', 'ka', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn',
    'ko', 'kr', 'ks', 'ku', 'kv', 'kw', 'ky', 'la', 'lb', 'lg', 'li', 'ln',
    'lo', 'lt', 'lu', 'lv', 'mg', 'mh', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms',
    'mt', 'my', 'na', 'nb', 'nd', 'ne', 'ng', 'nl', 'nn', 'no', 'nr', 'nv',
    'ny', 'oc', 'oj', 'om', 'or', 'os', 'pa', 'pi', 'pl', 'ps', 'pt', 'qu',
    'rm', 'rn', 'ro', 'ru', 'rw', 'sa', 'sc', 'sd', 'se', 'sg', 'si', 'sk',
    'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'ss', 'st', 'su', 'sv', 'sw', 'ta',
    'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt', 'tw',
    'ty', 'ug', 'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'wo', 'xh', 'yi',
    'yo', 'za', 'zh', 'zu'
];

// Route to handle video upload
router.post('/upload', upload.fields([{ name: 'video' }, { name: 'thumbnail' }]), async (req, res) => {
    try {
        const { title, description, tags, category, default_language, default_audio_language, privacy_status, workspace_id } = req.body;
        const videoFile = req.files['video'][0];
        const thumbnailFile = req.files['thumbnail'][0];
        const io = req.io;

        // Validate required fields
        if (!title || !description || !tags || !category || !default_language || !default_audio_language || !privacy_status || !videoFile || !thumbnailFile) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Validate tags
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        if (tagsArray.length === 0) {
            return res.status(400).json({ message: 'Tags must contain comma-separated values' });
        }

        if (tagsArray.some(tag => tag.includes(' '))) {
            return res.status(400).json({ message: 'Tags cannot contain spaces - use commas for separation' });
        }

        // Validate ISO codes
        if (!VALID_ISO_CODES.includes(default_language.toLowerCase())) {
            return res.status(400).json({ message: 'Invalid Default Language ISO code' });
        }

        if (!VALID_ISO_CODES.includes(default_audio_language.toLowerCase())) {
            return res.status(400).json({ message: 'Invalid Default Audio Language ISO code' });
        }

        // Validate file sizes
        if (thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
            return res.status(400).json({ message: 'Thumbnail must be smaller than 2MB' });
        }

        if (videoFile.size > MAX_VIDEO_SIZE) {
            return res.status(400).json({ message: 'Video must be smaller than 256GB' });
        }

        const editor_id = req.user.id;

        // Fetch editor's name
        const editorQuery = 'SELECT username FROM users WHERE id = $1';
        const editorResult = await pool.query(editorQuery, [editor_id]);
        const editorName = editorResult.rows[0]?.username;

        const videoId = Date.now(); // Unique ID for the video
        const bucket = storage.bucket('youconnect-9671a.firebasestorage.app');

        // Define file paths
        const videoPath = `videos/${workspace_id}/${videoId}/${videoFile.originalname}`;
        const thumbnailPath = `videos/${workspace_id}/${videoId}/${thumbnailFile.originalname}`;

        // ------------------ Video Upload with Progress ------------------
        let videoUploadedBytes = 0;
        const videoTotalBytes = videoFile.size;
        // Create a readable stream from the video buffer
        const videoReadableStream = Readable.from(videoFile.buffer);
        // Create a write stream for video upload
        const videoUploadStream = bucket.file(videoPath).createWriteStream({
            metadata: { contentType: videoFile.mimetype }
        });

        // Listen for data chunks to calculate progress
        videoReadableStream.on('data', (chunk) => {
            videoUploadedBytes += chunk.length;
            const progressPercentage = Math.round((videoUploadedBytes / videoTotalBytes) * 100);
            io.to(String(editor_id)).emit('videoUploadProgress', { videoId, progress: progressPercentage });
        });

        await new Promise((resolve, reject) => {
            videoUploadStream.on('finish', resolve);
            videoUploadStream.on('error', reject);
            videoReadableStream.pipe(videoUploadStream);
        });

        // Emit additional status update: Video upload complete (25% overall)
        io.to(String(editor_id)).emit('uploadStatus', { stage: "Video Uploaded", progress: 25, message: "Video file uploaded." });

        // ------------------ Thumbnail Upload with Progress ------------------
        let thumbnailUploadedBytes = 0;
        const thumbnailTotalBytes = thumbnailFile.size;
        // Create a readable stream from the thumbnail buffer
        const thumbnailReadableStream = Readable.from(thumbnailFile.buffer);
        // Create a write stream for thumbnail upload
        const thumbnailUploadStream = bucket.file(thumbnailPath).createWriteStream({
            metadata: { contentType: thumbnailFile.mimetype }
        });

        // Listen for data chunks to calculate progress
        thumbnailReadableStream.on('data', (chunk) => {
            thumbnailUploadedBytes += chunk.length;
            const progressPercentage = Math.round((thumbnailUploadedBytes / thumbnailTotalBytes) * 100);
            io.to(String(editor_id)).emit('thumbnailUploadProgress', { videoId, progress: progressPercentage });
        });

        await new Promise((resolve, reject) => {
            thumbnailUploadStream.on('finish', resolve);
            thumbnailUploadStream.on('error', reject);
            thumbnailReadableStream.pipe(thumbnailUploadStream);
        });

        // Emit status update: File uploads complete
        io.to(String(editor_id)).emit('uploadStatus', { stage: "Files Uploaded", progress: 50, message: "Files uploaded. Generating public URLs..." });

        // Generate public URLs
        const videoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(videoPath)}?alt=media`;
        const thumbnailUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(thumbnailPath)}?alt=media`;

        // Emit status update: Public URLs generated
        io.to(String(editor_id)).emit('uploadStatus', { stage: "Generating URLs", progress: 65, message: "Public URLs generated. Storing metadata..." });

        // Insert metadata into PostgreSQL
        const query = `
            INSERT INTO videos (title, description, tags, category, default_language, default_audio_language, privacy_status, video_url, thumbnail_url, status, workspace_id, editor_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', $10, $11)
            RETURNING id
        `;
        const values = [title, description, tags ? tags.split(',') : [], category, default_language, default_audio_language, privacy_status, videoUrl, thumbnailUrl, workspace_id, editor_id];
        const result = await pool.query(query, values);
        const uploadedVideoId = result.rows[0].id;

        // Emit status update: Metadata stored
        io.to(String(editor_id)).emit('uploadStatus', { stage: "Storing Metadata", progress: 80, message: "Metadata stored. Sending notification..." });

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

        // Emit final status update
        io.to(String(editor_id)).emit('uploadStatus', { stage: "Complete", progress: 100, message: "Upload complete!" });

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

        // Check if the workspace has granted YouTube access by looking for tokens in the database
        const tokenQuery = `
         SELECT oauth_token, oauth_refresh_token 
         FROM workspaces 
         WHERE id = $1
     `;
        const tokenResult = await pool.query(tokenQuery, [workspaceId]);
        const tokens = tokenResult.rows[0];

        if (!tokens || !tokens.oauth_token || !tokens.oauth_refresh_token) {
            return res.status(403).json({ message: 'Please grant access to your YouTube channel first.' });
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

        // Fetch YouTuber (workspace owner) details to send progress updates
        const youtuberQuery = `
         SELECT u.id AS recipient_id, u.username AS recipient_name
         FROM workspaces w
         INNER JOIN users u ON w.owner_id = u.id
         WHERE w.id = $1
        `;
        const youtuberResult = await pool.query(youtuberQuery, [workspaceId]);
        const youtuber = youtuberResult.rows[0];

        if (!youtuber) {
            return res.status(404).json({ message: 'YouTuber not found for the specified workspace.' });
        }

        // We'll emit progress events to the youtuber's room
        const youtuberRoom = String(youtuber.recipient_id);
        const io = req.io;

        // Emit initial progress: Approval process starting (10%)
        io.to(String(youtuberRoom)).emit('approveProgress', { progress: 10, stage: 'Starting approval process' });


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
        // (Here, progress is simulated since youtube.videos.insert does not emit progress events)
        io.to(String(youtuberRoom)).emit('approveProgress', { progress: 30, stage: 'Uploading video to YouTube' });

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

        io.to(String(youtuberRoom)).emit('approveProgress', { progress: 50, stage: 'Video uploaded to YouTube' });

        const youtubeVideoId = uploadResponse.data.id;

        io.to(String(youtuberRoom)).emit('approveProgress', { progress: 65, stage: 'Setting thumbnail on YouTube' });

        // Set the thumbnail
        await youtube.thumbnails.set({
            videoId: youtubeVideoId,
            media: {
                body: thumbnailStream,
            },
        });

        io.to(String(youtuberRoom)).emit('approveProgress', { progress: 75, stage: 'Thumbnail set' });

        // Update video status in PostgreSQL
        io.to(String(youtuberRoom)).emit('approveProgress', { progress: 80, stage: 'Updating video status in database' });

        // Update video status in PostgreSQL
        const updateQuery = `UPDATE videos SET status = 'Approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1`;
        await pool.query(updateQuery, [videoId]);

        io.to(String(youtuberRoom)).emit('approveProgress', { progress: 90, stage: 'Sending notification to editor' });

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

        // Emit final progress update (100%)
        io.to(String(youtuberRoom)).emit('approveProgress', { progress: 100, stage: 'Approval process complete' });


        // return res.status(200).json({ message: 'Video approved and uploaded successfully.', youtubeVideoId });
        setTimeout(() => {
            return res.status(200).json({ message: 'Video approved and uploaded successfully.', youtubeVideoId });
        }, 500);
    } catch (error) {
        console.error('Error approving and uploading video:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Route to reject video
router.post('/reject-video', async (req, res) => {
    try {
        const { videoId, workspaceId } = req.body;
        if (!videoId || !workspaceId) {
            return res.status(400).json({ message: 'Video ID and Workspace ID are required.' });
        }

        // Fetch video metadata
        const videoQuery = `SELECT * FROM videos WHERE id = $1 AND status = 'Pending'`;
        const videoResult = await pool.query(videoQuery, [videoId]);
        const video = videoResult.rows[0];

        if (!video) {
            return res.status(404).json({ message: 'Video not found or already processed.' });
        }

        const editorId = video.editor_id;

        // Update video status to 'Rejected'
        const updateQuery = `UPDATE videos SET status = 'Rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1`;
        await pool.query(updateQuery, [videoId]);

        // Send notification to the editor
        const notificationMessage = `Your video "${video.title}" has been rejected.`;
        const notificationQuery = `
        INSERT INTO general_notifications (
          recipient_id, recipient_role, message, notification_type, related_workspace_id, related_entity_id, related_entity_type, expires_at
        )
        VALUES ($1, 'editor', $2, 'review_response', $3, $4, 'video', CURRENT_TIMESTAMP + INTERVAL '3 days')
      `;
        await pool.query(notificationQuery, [editorId, notificationMessage, workspaceId, videoId]);

        return res.status(200).json({ message: 'Video rejected.' });
    } catch (error) {
        console.error('Error rejecting video:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

export default router;