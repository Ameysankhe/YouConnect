import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import pool from './src/config/db.js';
import cors from 'cors';
import passport from './src/config/passport.js'
import authRoutes from './src/routes/auth.js';
import workspaceRoutes from './src/routes/workspaces.js'; // Import workspace routes
import workspaceDetailRoutes from './src/routes/workspaceDetails.js';
import uploadRoutes from './src/routes/upload.js'; // Import upload routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;


// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware to handle OPTIONS requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});


// Middlewares
app.options('*', cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  store: new (pgSession(session))({
    pool: pool,  
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    // secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/workspaces', workspaceRoutes); 
app.use('/workspace', workspaceDetailRoutes);
app.use('/videos', uploadRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
