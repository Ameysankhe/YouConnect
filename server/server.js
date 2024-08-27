import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import cors from 'cors'; 
import passport from './src/config/passport.js'
import authRoutes from './src/routes/auth.js';
import uploadRoutes from './src/routes/upload.js'; // Import upload routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;


// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }));
  
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/videos', uploadRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
