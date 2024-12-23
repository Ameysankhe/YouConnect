import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Route to create a new workspace
router.post('/create', async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.id; // Assuming req.user is set after authentication

    if (!name) {
        return res.status(400).json({ error: 'Workspace name is required.' });
    }

    try {
        const query = `
            INSERT INTO workspaces (name, description, owner_id, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`;
        const values = [name, description || null, userId];

        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Workspace created successfully', workspace: result.rows[0] });
    } catch (error) {
        console.error('Error creating workspace:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Route to fetch all workspaces for the logged-in user
router.get('/', async (req, res) => {
    const userId = req.user.id; // Assuming req.user is set after authentication

    try {
        const query = `
            SELECT id, name, description, created_at
            FROM workspaces
            WHERE owner_id = $1
            ORDER BY created_at DESC`;
        const result = await pool.query(query, [userId]);

        res.status(200).json({ workspaces: result.rows });
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});




export default router;
