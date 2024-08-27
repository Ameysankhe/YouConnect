import express from 'express';
import fileUpload from 'express-fileupload';
import oauth2Client from '../config/oauth2.js';
import { google } from 'googleapis';

const router = express.Router();

router.use(fileUpload());

// Middleware to ensure the user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (!oauth2Client.credentials) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  next();
};

// Route to handle video uploads
router.post('/upload', ensureAuthenticated, async (req, res) => {
  const { title, description } = req.body;
  const { file } = req.files;

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  try {
    const response = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: title,
          description: description,
        },
        status: {
          privacyStatus: 'private',
        },
      },
      media: {
        body: file.data,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Failed to upload video', error });
  }
});

export default router;
