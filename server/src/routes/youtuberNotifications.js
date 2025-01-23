import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Fetch notifications for YouTuber in workspace
router.get('/notifications/:workspaceId', async (req, res) => {
    const { workspaceId } = req.params;

    try {
        const query = `
        SELECT gn.id, gn.message, gn.created_at
        FROM general_notifications gn
        JOIN workspaces w ON w.id = gn.related_workspace_id
        WHERE w.id = $1 AND gn.recipient_role = 'youtuber' AND w.owner_id = $2
        ORDER BY gn.created_at DESC
    `;
        const result = await pool.query(query, [workspaceId, req.user.id]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching notifications for YouTuber:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Add notification when editor accepts/declines
const addYoutuberNotification = async (workspaceId, editorId, message,  workspaceEditorId) => {
    try {
        const query = `
    INSERT INTO general_notifications (related_workspace_id, recipient_id, message, recipient_role, notification_type, related_entity_id,
                related_entity_type, expires_at)
    VALUES ($1, $2, $3, 'youtuber', 'invite_response', $4, 'workspace_editor', CURRENT_TIMESTAMP + INTERVAL '3 days')
`;
        await pool.query(query, [workspaceId, editorId, message, workspaceEditorId]);
    } catch (error) {
        console.error('Error adding YouTuber notification:', error);
    }
};

// Function to delete expired notifications
const deleteExpiredNotifications = async () => {
    try {
        const query = `
            DELETE FROM general_notifications
            WHERE expires_at <= CURRENT_TIMESTAMP;
        `;
        await pool.query(query);
        console.log('Expired notifications deleted successfully');
    } catch (error) {
        console.error('Error deleting expired notifications:', error);
    }
};

// Set up periodic cleanup of expired notifications (every 24 hours)
setInterval(deleteExpiredNotifications, 24 * 60 * 60 * 1000); // 24 hours in milliseconds


export { router, addYoutuberNotification };
