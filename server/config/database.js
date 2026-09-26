const mongoose = require('mongoose');
const config = require("./config");

// One shared connection. On serverless hosts (Vercel) each warm instance reuses it
// instead of reconnecting on every request; a failed attempt is retried next time.
let connecting = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return mongoose.connection;

    if (!connecting) {
        connecting = mongoose
            .connect(config.databaseURI, { serverSelectionTimeoutMS: 10000 })
            .then((conn) => {
                console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
                return conn;
            })
            .catch((error) => {
                connecting = null;
                console.error(`❌ Database connection failed: ${error.message}`);
                throw error;
            });
    }

    return connecting;
}

module.exports = connectDB;
