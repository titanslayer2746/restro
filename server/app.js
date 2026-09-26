const express = require('express');
const app = express();
const config = require("./config/config");
const connectDB = require('./config/database');
const globalErrorHandler = require('./middlewares/globalErrorHandler');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const createHttpError = require("http-errors");

// Environment config
const PORT = config.port || process.env.PORT || 10000;

// ✅ CORS Configuration
// The deployed frontend, any extra frontends from CLIENT_URL, plus local dev servers
const allowedOrigins = [
    "https://restro-seven-mu.vercel.app",
    ...config.clientUrls,
    "http://localhost:5173", // Vite dev server
    "http://localhost:3000", // Alternative dev server
    "http://127.0.0.1:5173"  // Alternative localhost
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (same-origin proxy, mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        // In development, allow all origins
        if (config.nodeEnv === 'development') return callback(null, true);

        // Unknown origins get no CORS headers, so the browser blocks them (instead of a 500)
        return callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Hello from the POS server!' });
});

// Make sure the database is connected before any API request.
// On a cold start this waits for the connection; if it fails the request gets a 503
// and the next request tries again, instead of the whole process exiting.
app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(createHttpError(503, "Database is unavailable, please try again"));
    }
});

// Routes
app.use('/api/user', require('./routes/userRoute'));
app.use('/api/order', require('./routes/orderRoute'));
app.use('/api/table', require('./routes/tableRoute'));
app.use('/api/customer', require('./routes/customerRoute'));
app.use('/api/menu', require('./routes/menuRoute'));

// Global Error Handler
app.use(globalErrorHandler);

// Start a long-running server locally / on Render. On Vercel the exported app is used instead.
if (!process.env.VERCEL) {
    connectDB().catch(() => {});

    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`POS Server is running on port ${PORT}`);
        console.log(`Environment: ${config.nodeEnv}`);
    });

    // Handle server errors
    server.on('error', (err) => {
        console.error('Server error:', err);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        server.close(() => {
            console.log('Process terminated');
        });
    });
}

module.exports = app;
