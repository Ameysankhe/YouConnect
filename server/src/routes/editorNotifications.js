import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Route to fetch notifications for an editor
router.get('/notifications', async (req, res) => {
    console.log(req.user.id)
    const editorId = req.user.id; // Assuming req.user contains the logged-in editor's data

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

        // Update the notification status
        await pool.query('UPDATE notifications SET status = $1 WHERE id = $2', ['accepted', notificationId]);

        // Update the workspace_editor status to accepted
        await pool.query('UPDATE workspace_editors SET status = $1 WHERE id = $2', ['Accepted', workspaceEditorId]);

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
        const workspaceEditorId = notificationResult.rows[0].workspace_editor_id;
        await pool.query('UPDATE workspace_editors SET status = $1 WHERE id = $2', ['Declined', workspaceEditorId]);

        res.status(200).json({ message: 'Invite declined successfully' });
    } catch (error) {
        console.error('Error declining invite:', error);
        res.status(500).json({ error: 'Failed to decline invite' });
    }
});

// Route to get the workspaces the editor has accepted
router.get('/workspaces', async (req, res) => {
    console.log('Authenticated user:', req.user);
    const editorId = req.user.id; // Assuming req.user contains the logged-in editor's data

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
