import express from 'express';
import fetch from 'node-fetch';
import pool from '../config/db.js';

const router = express.Router();

// Route to fetch workspace details by ID and the user's role
router.get('/:id', async (req, res) => {
    const workspaceId = req.params.id;
    const userId = req.user.id; // Assuming user is authenticated and their ID is available here

    try {
        // Query to get workspace details
        const workspaceQuery = `
            SELECT id, name, description, created_at, oauth_token
            FROM workspaces
            WHERE id = $1
        `;
        const workspaceResult = await pool.query(workspaceQuery, [workspaceId]);

        if (workspaceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        // Query to get user role
        const roleQuery = `
            SELECT role
            FROM users
            WHERE id = $1
        `;
        const roleResult = await pool.query(roleQuery, [userId]);

        if (roleResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const role = roleResult.rows[0].role; // Get user role from the result

        // Send back the workspace details along with the user's role
        res.status(200).json({
            workspace: workspaceResult.rows[0], // Workspace details
            userRole: role // User role
        });

    } catch (error) {
        console.error('Error fetching workspace details:', error);
        res.status(500).json({ error: 'An error occurred while fetching workspace details.' });
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
            // Optionally, send a notification to the editor (in-app or email)
            // For now, we can assume the editor will be notified upon their next login or dashboard load
            const workspaceEditorId = result.rows[0].id;

            // Fetch the workspace name
            const workspaceQuery = `SELECT name FROM workspaces WHERE id = $1`;
            const workspaceResult = await pool.query(workspaceQuery, [workspaceId]);

            if (workspaceResult.rows.length > 0) {
                const workspaceName = workspaceResult.rows[0].name;

                // Create a notification for the editor
                const message = `You have been invited to join workspace '${workspaceName}'.`;
                const actionType = 'invite';  // Example action type (can be customized)
                const status = 'pending';  // Initial status of the notification

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

// Route to get list of videos by workspace ID
router.get('/:id/listofvideos', async (req, res) => {
    const workspaceId = req.params.id;
    try {
        const query = `
            SELECT id, title, description, status, thumbnail_url 
            FROM videos 
            WHERE workspace_id = $1
        `;
        const result = await pool.query(query, [workspaceId]);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching videos:', error);
        return res.status(500).json({ message: 'Failed to fetch video data.' });
    }
});

// Route to fetch videos for approval
router.get('/:id/approve-videos', async (req, res) => {
    const workspaceId = req.params.id;
  
    try {
      const result = await pool.query(
        `SELECT id, title, description, thumbnail_url, video_url 
         FROM videos 
         WHERE workspace_id = $1 AND status = 'Pending'`,
        [workspaceId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ error: 'Failed to fetch videos.' });
    }
  });
  

export default router;