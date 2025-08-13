const { MongoClient } = require('mongodb');

// Use Railway's URI or fallback to local
const url = process.env.URI || 'mongodb://localhost:27017/wordmaster';

console.log(' CONNECTION DEBUG:');
console.log('Environment URI exists:', !!process.env.URI);
console.log('Using URL:', url.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB');

// Create and connect client immediately
const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Connect immediately when this module loads (synchronous-style for compatibility)
const connectImmediately = async () => {
    try {
        console.log(' Attempting to connect to MongoDB...');
        await client.connect();
        console.log(' Connected to MongoDB successfully');
    } catch (error) {
        console.error(' MongoDB connection error:', error.message);
        // Don't throw here - let the app continue and fail gracefully when db operations are attempted
    }
};

// Start connection immediately
connectImmediately();

// Legacy functions for server.js compatibility
const connectDB = async () => {
    // Connection already started, just return client
    return client;
};

const getDB = () => {
    return client.db();
};

const closeDB = async () => {
    await client.close();
    console.log('MongoDB connection closed');
};

// Export client directly for your existing model files
module.exports = {
    client,
    connectDB,
    getDB,
    closeDB
};