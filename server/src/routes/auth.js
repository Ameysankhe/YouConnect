import express from 'express';
import oauth2Client from '../config/oauth2.js';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const router = express.Router();

// Local authentication routes
// Registration route
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // Check if the user already exists
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

         // Insert new user into the database
         await pool.query('INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)', [email, hashedPassword, role]);

         res.status(201).json({ message: 'User registered successfully' });
     } catch (error) {
         console.error('Error registering user:', error);
         res.status(500).json({ message: 'Server error' });
     }
});

// Handle the login route
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: info.message });
      
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({ message: 'Logged in successfully' });
      });
    })(req, res, next);
});
  
router.post('/logout', (req, res) => {
    req.logout();
    res.json({ message: 'Logged out successfully' });
});

const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

let oauth2Tokens = {};

// Generate an OAuth URL and redirect to Google for authentication
router.get('/youtube/login', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(url);
});

// Handle the OAuth callback
router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    // Store tokens securely in a real application
    oauth2Tokens = tokens;
    res.json(tokens);
  } catch (error) {
    console.error('Error retrieving access token', error);
    res.status(500).send('Authentication failed');
  }
});

export default router;
