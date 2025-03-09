import express from 'express';
import pool from '../config/db.js';
import { addYoutuberNotification } from './youtuberNotifications.js';

const router = express.Router();

// Function to delete expired notifications (run periodically)
const deleteExpiredNotifications = async () => {
    try {
        const deleteQuery = `
            DELETE FROM notifications 
            WHERE created_at < NOW() - INTERVAL '3 days' 
            AND status = 'pending'`;
        await pool.query(deleteQuery);
        console.log('Expired notifications deleted successfully');
    } catch (error) {
        console.error('Error deleting expired notifications:', error);
    }
};

// Run the cleanup function every 24 hours (86400000 milliseconds)
setInterval(deleteExpiredNotifications, 24 * 60 * 60 * 1000);

// Route to fetch notifications for an editor on dashboard
router.get('/notifications', async (req, res) => {
    console.log(req.user.id)
    const editorId = req.user.id; 

    try {
        const query = `
            SELECT id, message, action_type, status, created_at
            FROM notifications
            WHERE editor_id = $1
            AND status = 'pending'
            ORDER BY created_at DESC`;
        const result = await pool.query(query, [editorId]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Fetch notifications for editor in workspace
router.get('/notifications/:workspaceId', async (req, res) => {
    const { workspaceId } = req.params;

    try {
         const query = `
         SELECT gn.id, gn.message, gn.created_at
         FROM general_notifications gn
         JOIN workspaces w ON w.id = gn.related_workspace_id
         JOIN workspace_editors we ON we.workspace_id = w.id
         WHERE w.id = $1 
           AND gn.recipient_role = 'editor' 
           AND we.editor_id = $2
           AND we.status = 'Accepted'
         ORDER BY gn.created_at DESC
         `;
        const result = await pool.query(query, [workspaceId, req.user.id]);
        console.log('Result:', result.rows);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching notifications for editor:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Accept the invite
router.post('/notifications/accept/:notificationId', async (req, res) => {
    const { notificationId } = req.params;

    try {
        // Fetch the editor's notification
        const notificationQuery = `
            SELECT * FROM notifications WHERE id = $1 AND status = 'pending'
        `;
        const notificationResult = await pool.query(notificationQuery, [notificationId]);

        if (notificationResult.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found or already processed' });
        }

        const editorId = notificationResult.rows[0].editor_id;
        const workspaceEditorId = notificationResult.rows[0].workspace_editor_id;

        // Fetch the editor's username
        const editorQuery = `
         SELECT username FROM users WHERE id = $1
     `;
        const editorResult = await pool.query(editorQuery, [editorId]);
        const editorName = editorResult.rows[0].username;

        // Update the notification status
        await pool.query('UPDATE notifications SET status = $1 WHERE id = $2', ['accepted', notificationId]);

        // Update the workspace_editor status to accepted
        await pool.query('UPDATE workspace_editors SET status = $1 WHERE id = $2', ['Accepted', workspaceEditorId]);

        // Send notification to YouTuber or other relevant party
        const workspaceQuery = `
        SELECT workspace_id FROM workspace_editors WHERE id = $1
    `;
        const workspaceResult = await pool.query(workspaceQuery, [workspaceEditorId]);
        const workspaceId = workspaceResult.rows[0].workspace_id;

        // Modify the message to include the editor's name
        const message = `${editorName} has accepted the workspace invitation.`;

        await addYoutuberNotification(workspaceId, editorId, message, workspaceEditorId);


        res.status(200).json({ message: 'Invite accepted successfully' });

    } catch (error) {
        console.error('Error accepting invite:', error);
        res.status(500).json({ error: 'Failed to accept invite' });
    }
});

// Decline the invite
router.post('/notifications/decline/:notificationId', async (req, res) => {
    const { notificationId } = req.params;

    try {
        // Fetch the editor's notification
        const notificationQuery = `
            SELECT * FROM notifications WHERE id = $1 AND status = 'pending'
        `;
        const notificationResult = await pool.query(notificationQuery, [notificationId]);

        if (notificationResult.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found or already processed' });
        }

        // Update the notification status
        await pool.query('UPDATE notifications SET status = $1 WHERE id = $2', ['declined', notificationId]);

        // Update the workspace_editor status to declined
        const editorId = notificationResult.rows[0].editor_id;
        const workspaceEditorId = notificationResult.rows[0].workspace_editor_id;
        const editorQuery = `
        SELECT username FROM users WHERE id = $1
    `;
        const editorResult = await pool.query(editorQuery, [editorId]);
        const editorName = editorResult.rows[0].username;
        await pool.query('UPDATE workspace_editors SET status = $1 WHERE id = $2', ['Declined', workspaceEditorId]);

        // Send notification to YouTuber or other relevant party
        const workspaceQuery = `
            SELECT workspace_id FROM workspace_editors WHERE id = $1
        `;
        const workspaceResult = await pool.query(workspaceQuery, [workspaceEditorId]);
        const workspaceId = workspaceResult.rows[0].workspace_id;

        // Modify the message to include the editor's name
        const message = `${editorName} has declined the workspace invitation.`;

        await addYoutuberNotification(workspaceId, editorId, message, workspaceEditorId);

        res.status(200).json({ message: 'Invite declined successfully' });

    } catch (error) {
        console.error('Error declining invite:', error);
        res.status(500).json({ error: 'Failed to decline invite' });
    }
});

// Route to get the workspaces the editor has accepted
router.get('/workspaces', async (req, res) => {
    console.log('Authenticated user:', req.user);
    const editorId = req.user.id;

    try {
        const query = `
            SELECT w.id, w.name, w.description
            FROM workspaces w
            JOIN workspace_editors we ON w.id = we.workspace_id
            WHERE we.editor_id = $1 AND we.status = 'Accepted'
        `;
        const result = await pool.query(query, [editorId]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
});


export default router;
