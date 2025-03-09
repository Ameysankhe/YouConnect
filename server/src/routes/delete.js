import express from 'express';
import storage from '../config/firebase.js';
import pool from '../config/db.js';

const router = express.Router();

router.delete('/delete/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;

        // Fetch the video record from PostgreSQL
        const videoQuery = 'SELECT * FROM videos WHERE id = $1';
        const videoResult = await pool.query(videoQuery, [videoId]);
        if (videoResult.rows.length === 0) {
            return res.status(404).json({ message: 'Video not found' });
        }
        const video = videoResult.rows[0];

        // Get the Firebase bucket
        const bucket = storage.bucket('youconnect-9671a.firebasestorage.app');

        // Extract the file path from the stored video URL
        const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/`;
        let videoFilePath = video.video_url.replace(baseUrl, '').split('?')[0];
        const decodedPath = decodeURIComponent(videoFilePath);
        const folderPath = decodedPath.substring(0, decodedPath.lastIndexOf('/') + 1); 

        // Delete all files under the folder
        await bucket.deleteFiles({ prefix: folderPath });

        // Delete video metadata from PostgreSQL
        const deleteQuery = 'DELETE FROM videos WHERE id = $1';
        await pool.query(deleteQuery, [videoId]);

        // Fetch the YouTuber (workspace owner) details to send notification
        const youtuberQuery = `
        SELECT u.id AS recipient_id 
        FROM workspaces w 
        INNER JOIN users u ON w.owner_id = u.id 
        WHERE w.id = $1
        `;
        const youtuberResult = await pool.query(youtuberQuery, [video.workspace_id]);
        if (youtuberResult.rows.length === 0) {
            return res.status(200).json({ message: 'Video deleted successfully.' });
        }
        const youtuber = youtuberResult.rows[0];

        // Create notification message for video deletion
        const notificationMessage = `Your video "${video.title}" has been removed from your storage.`;
        const notificationQuery = `
        INSERT INTO general_notifications 
        (recipient_id, recipient_role, message, notification_type, related_workspace_id, related_entity_id, related_entity_type, expires_at)
        VALUES ($1, 'youtuber', $2, 'video_deletion', $3, $4, 'video', CURRENT_TIMESTAMP + INTERVAL '3 days')
        `;
        await pool.query(notificationQuery, [youtuber.recipient_id, notificationMessage, video.workspace_id, videoId]);

        return res.status(200).json({ message: 'Video deleted successfully.' });
    } catch (error) {
        console.error('Error deleting video:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

export default router;
