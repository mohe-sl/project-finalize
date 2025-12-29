import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import dns from 'dns';
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Import Routes
import projectRoutes from "./routes/projectRoutes.js";
import projectProgressRoutes from "./routes/projectProgressRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();

// Middleware
// Allow requests from the frontend dev server(s). In development we accept
// either the Vite default port 5173 or 5174 (your current frontend origin).
// For convenience we allow any origin during local development — change this
// to a stricter value for production.
// CORS setup - allow specific dev origins (add ports as needed)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log('CORS request:', {
      origin,
      method: req.method,
      url: req.url,
      headers: req.headers
    });
  if (!origin) {
    // non-browser request (curl/postman)
    return next();
  }
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    return next();
  }
  // Origin not allowed
  return res.status(403).json({ message: 'CORS origin forbidden' });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(express.json()); // parse JSON bodies

// Ensure uploads directory exists and serve static files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/api/uploads", express.static(uploadsDir)); // serve uploaded images

// Routes
app.use("/api/projects", projectRoutes);       // Project CRUD
app.use("/api/progress", projectProgressRoutes); // Project Progress CRUD
app.use("/api/users", userRoutes);            // User Registration and Authentication

// MongoDB connection with local fallback
const connectWithFallback = async () => {
  const primary = process.env.MONGO_URI;
  const fallback = 'mongodb://localhost:27017/project_app';

  if (!primary) {
    console.warn('⚠️ No MONGO_URI provided, trying local MongoDB...');
  }

  try {
    await mongoose.connect(primary || fallback, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB Connected to', primary ? 'primary (MONGO_URI)' : 'local fallback');
    return;
  } catch (errPrimary) {
    console.error('❌ Primary MongoDB connection error:', errPrimary && errPrimary.message ? errPrimary.message : errPrimary);
    // If primary failed, try local fallback
    if (primary) {
      try {
        console.log('➡️ Attempting to connect to local MongoDB fallback at', fallback);
        await mongoose.connect(fallback, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB Connected to local fallback:', fallback);
        return;
      } catch (errFallback) {
        console.error('❌ Local MongoDB fallback connection error:', errFallback && errFallback.message ? errFallback.message : errFallback);
      }
    }

    console.error('❌ Unable to connect to any MongoDB instance. Please ensure either Atlas network access is configured or a local MongoDB is running.');
  }
};

connectWithFallback();

// Start Server
const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${PORT} is busy, trying ${PORT + 1}...`);
        setTimeout(() => {
          server.close();
          app.listen(PORT + 1, () => {
            console.log(`🚀 Server running on http://localhost:${PORT + 1}`);
          });
        }, 1000);
      } else {
        console.error('❌ Server error:', error);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
