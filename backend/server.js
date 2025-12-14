const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();
const path = require('path');
// Optional in-memory MongoDB for local development fallback
let { MongoMemoryServer } = { MongoMemoryServer: null };
try {
    // require lazily — package may not be installed in production
    MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
} catch (e) {
    // ignore if not installed; we'll only use it when available
}

// Ensure the casing of your route files matches here (e.g., 'events' not 'Events')
const authRoutes = require('./routes/auth');
const lostFoundRoutes = require('./routes/LostFound');
const eventsRoutes = require('./routes/Event');

const app = express();

// Middleware: security, compression, CORS and body parsing
app.use(helmet());
app.use(compression());
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? FRONTEND_URL : true }));
app.use(express.json());

// MongoDB Connection
async function connectWithFallback() {
    const primaryUri = process.env.MONGODB_URI;
    console.log('📡 Attempting to connect to MongoDB...');
    if (primaryUri) console.log('🔗 Connection URL:', primaryUri);

        try {
            if (primaryUri) {
                await mongoose.connect(primaryUri, {
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            family: 4,
            useNewUrlParser: true,
            useUnifiedTopology: true
                });
            } else {
                throw new Error('No primary MONGODB_URI configured');
            }
        console.log('✅ MongoDB Connected Successfully');
        console.log('🏢 Database Name:', mongoose.connection.name);
        console.log('🖥️  Server Address:', mongoose.connection.host);
        return;
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        // If in production, do not attempt memory fallback
        if (process.env.NODE_ENV === 'production') {
            console.error('Production environment — aborting due to DB connection failure.');
            return;
        }

        // Try local mongodb://localhost:27017/klh-campus next
        const localUri = 'mongodb://127.0.0.1:27017/klh-campus';
        try {
            console.log('🔁 Trying local MongoDB at', localUri);
            await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 10000 });
            console.log('✅ Connected to local MongoDB');
            return;
        } catch (localErr) {
            console.error('❌ Local MongoDB connection failed:', localErr.message);
        }

        // If mongodb-memory-server is available, start it and connect
        if (MongoMemoryServer) {
            try {
                console.log('🔁 Starting in-memory MongoDB for development...');
                const mongod = await MongoMemoryServer.create();
                const uri = mongod.getUri();
                await mongoose.connect(uri, { serverSelectionTimeoutMS: 30000, connectTimeoutMS: 30000, socketTimeoutMS: 45000, family: 4 });
                console.log('✅ Connected to in-memory MongoDB (development).');
                console.log('ℹ️  Note: data will be ephemeral and lost on restart.');
                return;
            } catch (memErr) {
                console.error('❌ In-memory MongoDB failed to start:', memErr.message);
            }
        }

        console.error('🔚 All MongoDB connection attempts failed. The app will continue running but DB features will be unavailable.');
    }
}

// start connection attempt but don't block the rest of startup
connectWithFallback();

// Mongoose connection event listeners for better visibility
mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose connected');
});
mongoose.connection.on('reconnected', () => {
    console.log('🔁 Mongoose reconnected');
});
mongoose.connection.on('error', err => {
    console.error('🔴 Mongoose connection error:', err && err.message);
});
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ Mongoose disconnected');
});

process.on('SIGINT', async () => {
    console.log('SIGINT received: closing mongoose connection');
    await mongoose.connection.close(false);
    process.exit(0);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lostfound', lostFoundRoutes);
app.use('/api/events', eventsRoutes);

// Serve frontend static files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Fallback: serve index.html for non-API routes (SPA support)
// Use '/*' pattern to avoid path-to-regexp parsing error for lone '*'
// Use a middleware fallback to avoid path-to-regexp parsing issues
app.use((req, res, next) => {
    // Only handle non-API GET requests and serve the SPA entry
    if (req.path.startsWith('/api')) return next();
    if (req.method !== 'GET') return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', time: new Date() });
});

// Error handling middleware (Good practice for production)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something broke!', error: err.message });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});