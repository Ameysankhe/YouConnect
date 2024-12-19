import express from 'express';
import fetch from 'node-fetch';  
import pool from '../config/db.js';

const router = express.Router();

// Route to fetch workspace details by ID
router.get('/:id', async (req, res) => {
    const workspaceId = req.params.id;
    console.log('Workspace ID from params:', workspaceId);
    try {
        const query = `
        SELECT id, name, description, created_at, oauth_token
        FROM workspaces
        WHERE id = $1`;
        const result = await pool.query(query, [workspaceId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching workspace details:', error);
        res.status(500).json({ error: 'Internal server error.' });
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
                    'UPDATE workspaces SET oauth_token = NULL, oauth_refresh_token = NULL WHERE id = $1',
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
        res.status(500).json({ message: 'Failed to revoke access' });
    }
});

export default router;
