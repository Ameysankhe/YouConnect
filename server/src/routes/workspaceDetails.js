import express from 'express';
import fetch from 'node-fetch';
import pool from '../config/db.js';
import storage from '../config/firebase.js';

const router = express.Router();

// Route to fetch workspace details by ID and the user's role
router.get('/:id', async (req, res) => {
    const workspaceId = req.params.id;
    const userId = req.user.id;

    try {

        const workspaceQuery = `
            SELECT w.id, w.name, w.description, w.created_at, w.oauth_token, w.owner_id, u.username AS owner_name
            FROM workspaces w
            JOIN users u ON w.owner_id = u.id
            WHERE w.id = $1
        `;
        const workspaceResult = await pool.query(workspaceQuery, [workspaceId]);

        if (workspaceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        const workspace = workspaceResult.rows[0];

        const roleQuery = `
            SELECT role
            FROM users
            WHERE id = $1
        `;
        const roleResult = await pool.query(roleQuery, [userId]);

        if (roleResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userRole = roleResult.rows[0].role;

        const isOwner = workspace.owner_id === userId;

        const isEditor = await pool.query(`
            SELECT 
            FROM workspace_editors
            WHERE workspace_id = $1 AND editor_id = $2 AND status = 'Accepted'
        `, [workspaceId, userId]);

        if (isOwner || isEditor.rows.length > 0) {
            // User has access: return workspace details + role
            return res.status(200).json({
                workspace: workspace,
                userRole: userRole
            });
        } else {
            // User has no access: return 403 with role
            return res.status(403).json({
                error: 'You do not have permission to access this workspace',
                userRole: userRole // Include the role here!
            });
        }
    } catch (error) {
        console.error('Error fetching workspace details:', error);
        res.status(500).json({ error: 'An error occurred while fetching workspace details.' });
    }
});

router.get('/:id/details', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      // Return the complete currentUser data from req.user
      return res.status(200).json({ currentUser: req.user });
    } catch (error) {
      console.error('Error fetching current user details:', error);
      return res.status(500).json({ error: 'An error occurred while fetching user details.' });
    }
});

// Revoke access from Google
const revokeGoogleAccess = async (oauthToken) => {
    const revokeUrl = `https://accounts.google.com/o/oauth2/revoke?token=${oauthToken}`;
    try {
        const response = await fetch(revokeUrl, { method: 'POST' });
        if (response.ok) {
            console.log('Access revoked from Google successfully');
            return true;
        } else {
            console.error('Failed to revoke access from Google');
            return false;
        }
    } catch (error) {
        console.error('Error revoking access from Google:', error);
        return false;
    }
};

// Revoke access from postgres
router.post('/:id/revoke-access', async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch the OAuth token from the database
        const result = await pool.query('SELECT oauth_token FROM workspaces WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        const oauthToken = result.rows[0].oauth_token;

        if (oauthToken) {
            // Revoke access from Google
            const revokeSuccess = await revokeGoogleAccess(oauthToken);

            if (revokeSuccess) {
                // Remove tokens from your database after successful revocation
                await pool.query(
                    'UPDATE workspaces SET oauth_token = NULL, oauth_refresh_token = NULL, expires_at = NULL WHERE id = $1',
                    [id]
                );
                return res.status(200).json({ message: 'Access revoked successfully' });
            } else {
                return res.status(500).json({ message: 'Failed to revoke access from Google' });
            }
        } else {
            return res.status(400).json({ message: 'No OAuth token found for this workspace' });
        }
    } catch (error) {
        console.error('Error revoking access:', error);
        res.status(500).json({ message: 'Failed to revoke access.' });
    }
});

// Route to add an editor to the workspace
router.post('/:id/add-editor', async (req, res) => {
    const { email } = req.body;
    const workspaceId = req.params.id;

    try {
        // Find the user by email
        const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Editor not found' });
        }

        const editorId = userResult.rows[0].id;

        // Insert into workspace_editors table
        const query = `
            INSERT INTO workspace_editors (workspace_id, editor_id, status)
            VALUES ($1, $2, 'Pending')
            RETURNING id`;
        const result = await pool.query(query, [workspaceId, editorId]);

        if (result.rows.length > 0) {
            const workspaceEditorId = result.rows[0].id;

            // Fetch the workspace name
            const workspaceQuery = `SELECT name FROM workspaces WHERE id = $1`;
            const workspaceResult = await pool.query(workspaceQuery, [workspaceId]);

            if (workspaceResult.rows.length > 0) {
                const workspaceName = workspaceResult.rows[0].name;

                // Create a notification for the editor
                const message = `You have been invited to join workspace '${workspaceName}'.`;
                const actionType = 'invite';
                const status = 'pending';

                // Insert notification into the database
                const notificationQuery = `
                INSERT INTO notifications (
                editor_id, message, action_type, status, workspace_editor_id, expires_at
                )
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP + INTERVAL '3 days')`;
                await pool.query(notificationQuery, [
                    editorId,
                    message,
                    actionType,
                    status,
                    workspaceEditorId
                ]);


                res.status(200).json({ message: 'Editor added and notification sent successfully' });

            } else {
                res.status(500).json({ message: 'Failed to retrieve workspace name' });
            }
        }
        else {
            res.status(500).json({ message: 'Failed to add editor' });
        }
    } catch (error) {
        console.error('Error adding editor:', error);
        res.status(500).json({ message: 'An error occurred while adding an editor.' });
    }
});

// Route to remove an editor (hard delete) from a workspace
router.delete('/:workspaceId/editor/:editorId', async (req, res) => {
    const { workspaceId, editorId } = req.params;
    const ownerId = req.user.id; // current user must be owner

    try {
        // Verify the current user is the owner of the workspace
        const workspaceQuery = `SELECT id, name, owner_id FROM workspaces WHERE id = $1`;
        const workspaceResult = await pool.query(workspaceQuery, [workspaceId]);
        if (workspaceResult.rows.length === 0) {
            return res.status(404).json({ message: 'Workspace not found.' });
        }
        const workspace = workspaceResult.rows[0];
        if (workspace.owner_id !== ownerId) {
            return res.status(403).json({ message: 'Only the workspace owner can remove editors.' });
        }

        // Delete from workspace_editors (hard delete)
        await pool.query(
            `DELETE FROM workspace_editors WHERE workspace_id = $1 AND editor_id = $2`,
            [workspaceId, editorId]
        );

        // // Delete videos uploaded by the editor in this workspace
        // await pool.query(
        //     `DELETE FROM videos WHERE workspace_id = $1 AND editor_id = $2`,
        //     [workspaceId, editorId]
        // );

        // Delete messages associated with this editor in the workspace.
        await pool.query(
            `DELETE FROM messages WHERE workspace_id = $1 AND (sender_id = $2 OR receiver_id = $2)`,
            [workspaceId, editorId]
        );

        // Insert a notification for the editor in the new table
        const notificationMessage = `You are no longer a member of ${workspace.name}`;
        await pool.query(
            `INSERT INTO editor_dashboard_notifications (editor_id, message, notification_type, created_at)
            VALUES ($1, $2, $3, NOW())`,
            [editorId, notificationMessage, 'workspace_deletion']
        );

        res.status(200).json({ message: 'Editor removed successfully.' });
    } catch (error) {
        console.error('Error removing editor:', error);
        res.status(500).json({ message: 'An error occurred while removing the editor.' });
    }
});


// Route to check if editor still has access to workspace
router.get('/check-access/:workspaceId', async (req, res) => {
    const { workspaceId } = req.params;
    const editorId = req.user.id;

    try {
        const query = `
            SELECT 1 
            FROM workspace_editors 
            WHERE workspace_id = $1 
            AND editor_id = $2 
            AND status = 'Accepted'`;
        const result = await pool.query(query, [workspaceId, editorId]);

        if (result.rows.length > 0) {
            res.status(200).json({ hasAccess: true });
        } else {
            res.status(200).json({ hasAccess: false });
        }
    } catch (error) {
        console.error('Error checking workspace access:', error);
        res.status(500).json({ error: 'Failed to check workspace access' });
    }
});

// Route to fetch editors for a specific workspace
router.get('/:id/editors', async (req, res) => {
    const workspaceId = req.params.id;

    // Query the database to get the editors for this workspace
    try {
        const query = `
            SELECT u.id, u.email, we.status
            FROM users u
            JOIN workspace_editors we ON u.id = we.editor_id
            WHERE we.workspace_id = $1;
        `;
        const result = await pool.query(query, [workspaceId]);

        if (result.rows.length === 0) {
            // Return an empty array with 200 OK
            return res.status(200).json([]);
        }

        // Send back the list of editors
        res.status(200).json(result.rows);

    } catch (err) {
        console.error('Error fetching editors:', err);
        res.status(500).json({ message: 'An error occurred while fetching editors.' });
    }
});

router.get('/:id/accepted-editors', async (req, res) => {
    const workspaceId = req.params.id;

    try {
        const query = `
            SELECT u.id, u.email
            FROM users u
            JOIN workspace_editors we ON u.id = we.editor_id
            WHERE we.workspace_id = $1 
            AND we.status = 'Accepted'
            ORDER BY u.email ASC`;
            
        const result = await pool.query(query, [workspaceId]);
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching accepted editors:', error);
        res.status(500).json({ 
            message: 'Failed to fetch accepted editors',
            error: error.message
        });
    }
});

// Route to get list of videos by workspace ID
router.get('/:id/listofvideos', async (req, res) => {
    const workspaceId = req.params.id;
    const editorId = req.user.id;
    try {
        const query = `
            SELECT id, title, description, status, thumbnail_url 
            FROM videos 
            WHERE workspace_id = $1 AND editor_id = $2
        `;
        const result = await pool.query(query, [workspaceId, editorId]);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching videos:', error);
        return res.status(500).json({ message: 'Failed to fetch video data.' });
    }
});

// // Route to fetch videos for approval
router.get('/:id/approve-videos', async (req, res) => {
    const workspaceId = req.params.id;
    const { editorId } = req.query;

    try {
        const result = await pool.query(
            `SELECT id, title, description, tags, category, default_language, default_audio_language, privacy_status, thumbnail_url, video_url 
         FROM videos 
         WHERE workspace_id = $1 AND status = 'Pending' AND editor_id = $2`,
            [workspaceId, editorId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos.' });
    }
});

// Route to delete a workspace
router.delete('/:id/delete', async (req, res) => {
    const workspaceId = req.params.id;
    const ownerId = req.user.id; // current user must be owner

    try {
        // Verify that the workspace exists and the current user is the owner
        const workspaceQuery = 'SELECT id, name, owner_id, oauth_token FROM workspaces WHERE id = $1';
        const workspaceResult = await pool.query(workspaceQuery, [workspaceId]);
        if (workspaceResult.rows.length === 0) {
            return res.status(404).json({ message: 'Workspace not found.' });
        }
        const workspace = workspaceResult.rows[0];
        if (workspace.owner_id !== ownerId) {
            return res.status(403).json({ message: 'Only the workspace owner can delete the workspace.' });
        }

        // Revoke Google access if token exists
        if (workspace.oauth_token) {
            const revokeSuccess = await revokeGoogleAccess(workspace.oauth_token);
            if (!revokeSuccess) {
                console.error('Google access revocation failed - proceeding with deletion anyway');
            }
        }

        // Delete Firebase storage files
        try {
            const bucket = storage.bucket('youconnect-9671a.firebasestorage.app');
            const folderPath = `videos/${workspaceId}`;

            console.log(`Deleting Firebase files in folder: ${folderPath}`);
            await bucket.deleteFiles({
                prefix: folderPath
            });
            console.log('Firebase files deleted successfully');
        } catch (firebaseError) {
            console.error('Error deleting Firebase files:', firebaseError);
            // Continue with deletion even if file cleanup fails
        }

        // Optionally, fetch the editors so that you can notify them after deletion
        const editorsResult = await pool.query(
            'SELECT editor_id FROM workspace_editors WHERE workspace_id = $1',
            [workspaceId]
        );
        const editors = editorsResult.rows;

        // Delete the workspace. With ON DELETE CASCADE on foreign keys,
        // related videos, messages, and workspace_editors will be removed automatically.
        await pool.query('DELETE FROM workspaces WHERE id = $1', [workspaceId]);

        // Optionally, notify each editor that the workspace has been deleted.
        for (const row of editors) {
            await pool.query(
                `INSERT INTO editor_dashboard_notifications (editor_id, message, notification_type, created_at)
           VALUES ($1, $2, $3, NOW())`,
                [row.editor_id, `${workspace.name} no longer exists`, 'workspace_deletion']
            );
        }

        res.status(200).json({ message: 'Workspace and all associated data deleted successfully.' });
    } catch (error) {
        console.error('Error deleting workspace:', error);
        res.status(500).json({ message: 'Failed to delete workspace.' });
    }
});



export default router;

