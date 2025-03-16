import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

router.post('/send', async (req, res) => {
  try {
    const { workspace_id, sender_id, receiver_id, message } = req.body;
    const result = await pool.query(
      'INSERT INTO messages (workspace_id, sender_id, receiver_id, message) VALUES ($1, $2, $3, $4) RETURNING timestamp',
      [workspace_id, sender_id, receiver_id, message]
    );
    const timestamp = result.rows[0].timestamp;
    req.io.to(`${receiver_id}`).emit('receive_message', { sender_id, message, timestamp });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Fetch chat history
router.get('/:workspace_id/:user1/:user2', async (req, res) => {
  try {
    const { workspace_id, user1, user2 } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM messages 
      WHERE workspace_id = $1 
      AND ((sender_id = $2 AND receiver_id = $3) OR (sender_id = $3 AND receiver_id = $2))
      ORDER BY timestamp ASC`,
      [workspace_id, user1, user2]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

export default router;
