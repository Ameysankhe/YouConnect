import express from 'express';
import oauth2Client from '../config/oauth2.js';
import passport from 'passport';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const router = express.Router();

// Local authentication routes

// 1)Handle registration route
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if the user already exists
    const emailResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailResult.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if the username already exists
    const usernameResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (usernameResult.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    await pool.query('INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)', [username, email, hashedPassword, role]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2)Handle the login route
router.post('/login', passport.authenticate('local'), (req, res) => {
  const userRole = req.user.role;

  if (userRole === 'youtuber') {
    res.json({ redirectUrl: '/youtuber/dashboard', role: userRole });
  } else {
    res.json({ redirectUrl: '/editor/dashboard', role: userRole });
  }
});

router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    // console.log('User is authenticated');
    // console.log(req.user);
    // console.log(req.session)
    res.json({ loggedIn: true, user: req.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// 3)Handle the logout route
router.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    req.session.destroy((error) => {
      if (error) {
        return res.status(500).json({ message: 'Failed to destroy session' });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      return res.json({ message: 'Logged out successfully' });
    });
  });
});

// 4)Handle the forgot-password route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists in the database
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Generate a reset token and its expiration time (1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save the token and expiration time in the user's record in the database
    const updateQuery = 'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3';
    await pool.query(updateQuery, [resetToken, resetTokenExpires, user.id]);

    // Create the reset link
    const protocol = req.protocol; // This will be 'http' in development
    const host = req.headers.host; // This will be 'localhost:4000' or 'localhost:3000' based on where the request is made
    const resetLink = `${protocol}://${host.replace(/:\d+$/, ':3000')}/reset-password?token=${resetToken}`;

    // Send the reset email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'ameysankhe18@gmail.com', // Your email
        pass: 'zlqk kgtj jggb kbjc'   // Your email password
      }
    });

    const mailOptions = {
      from: 'ameysankhe18@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please click the link to reset your password: ${resetLink}`,
      html: `<a href="${resetLink}">Reset Password</a>`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'A password reset link has been sent to your email address.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }

})

router.post('/reset-password', async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    // Find user by token and check if token has expired
    const userQuery = 'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2';
    const userResult = await pool.query(userQuery, [token, new Date(Date.now())]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = userResult.rows[0];

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the reset token and expiration
    const updateQuery = 'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2';
    await pool.query(updateQuery, [hashedPassword, user.id]);

    res.json({ message: 'Password has been successfully reset' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while resetting your password.' });
  }
});

// Youtube access route
// const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

// let oauth2Tokens = {};

// // Generate an OAuth URL and redirect to Google for authentication
// router.get('/youtube/login', (req, res) => {
//   const url = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
//   res.redirect(url);
// });

// // Handle the OAuth callback
// router.get('/oauth2callback', async (req, res) => {
//   const { code } = req.query;
//   try {
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);
//     // Store tokens securely in a real application
//     oauth2Tokens = tokens;
//     // res.json(tokens);
//     res.redirect('http://localhost:3000/youtuber/dashboard');
//   } catch (error) {
//     console.error('Error retrieving access token', error);
//     res.status(500).send('Authentication failed');
//   }
// });

// export default router;
