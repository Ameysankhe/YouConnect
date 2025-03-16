import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Route to create a new workspace
router.post('/create', async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.id; 

    if (!name || !description) {
        return res.status(400).json({ error: 'Both workspace name and description are required.' });
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
    const userId = req.user.id; 

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

// Route to fetch current user details (using the workspace ID for route structure)
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
  

export default router;
