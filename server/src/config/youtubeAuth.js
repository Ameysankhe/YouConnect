import { google } from 'googleapis';
import pool from './db.js'; // PostgreSQL connection

export const getAuthorizedClient = async (workspaceId) => {
    try {
        // Fetch OAuth tokens from the database
        const tokenQuery = `
        SELECT oauth_token, oauth_refresh_token, expires_at
        FROM workspaces
        WHERE id = $1
        `;
        const result = await pool.query(tokenQuery, [workspaceId]);

        if (result.rows.length === 0) {
            throw new Error('No OAuth tokens found for the given user.');
        }

        const { oauth_token, oauth_refresh_token, expires_at } = result.rows[0];

        // Check if the access token is expired or nearing expiration
        const currentTime = new Date();
        const expirationTime = new Date(expires_at);

        if (expirationTime <= currentTime) {
            // If expired, refresh the token
            const oAuth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URI
            );
            oAuth2Client.setCredentials({
                refresh_token: oauth_refresh_token,
            });

            // Refresh the token
            const { credentials } = await oAuth2Client.refreshAccessToken();
            const { access_token: newAccessToken, expiry_date } = credentials;

            // Update the new access token and expiration in the database
            const updateQuery = `
                UPDATE workspaces
                SET oauth_token = $1, expires_at = TO_TIMESTAMP($2)
                WHERE id = $3
            `;
            await pool.query(updateQuery, [newAccessToken, expiry_date / 1000, workspaceId]);

            // Set the new access token in the OAuth2 client
            oAuth2Client.setCredentials({
                access_token: newAccessToken,
                refresh_token: oauth_refresh_token,
            });

            return oAuth2Client;
        } else {
            // If the access token is valid, create OAuth2 client and return it
            const oAuth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URI
            );

            oAuth2Client.setCredentials({
                access_token: oauth_token,
                refresh_token: oauth_refresh_token,
            });

            return oAuth2Client;
        }
    } catch (error) {
        console.error('Error getting authorized client:', error);
        throw new Error('Could not retrieve OAuth credentials.');
    }
};
