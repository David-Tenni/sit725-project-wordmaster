var express = require("express");
var app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
const path = require('path');
require('dotenv').config();
const fs = require('fs');
const { connectDB } = require('./models/connection');

// Initialize database connection first
connectDB().catch(console.error);

// Important: Move the default route BEFORE static file serving so mainmenu is first
app.get('/', (req, res) => {
    const mainMenuPath = path.join(__dirname, 'views', 'mainMenu.html');
    if (fs.existsSync(mainMenuPath)) {
        res.sendFile(mainMenuPath);
    } else {
        res.status(404).send('mainMenu.html not found');
    }
});

// Favicon route
app.use('/favicon.ico', (req, res) => {
    const faviconPath = path.join(__dirname, 'views', 'img', 'logo.ico');
    if (fs.existsSync(faviconPath)) {
        res.sendFile(faviconPath);
    } else {
        res.status(404).send('Favicon not found');
    }
});

// Static file serving - keep these in this order
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(__dirname));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
var wordsApiRoutes = require('./routers/wordsRouter');
var usersApiRoutes = require('./routers/usersRouter');
var gameDataApiRoutes = require('./routers/gameDataRouter');

var port = process.env.PORT || 3000;

// Route Setup
app.use('/api/word', wordsApiRoutes);
app.use('/api/user', usersApiRoutes);
app.use('/api/game', gameDataApiRoutes);

// User Profile Route
const userProfileRouter = require('./routers/userProfileRouter');
app.use('/user', userProfileRouter);

// Socket Setup
require('./sockets/wordLength')(io.of('/word_length'));
require('./sockets/totalScore')(io.of('/total_score'));
require('./sockets/highScore')(io.of('/high_score'));
require('./sockets/wins')(io.of('/wins'));
require('./sockets/categories')(io.of('/categories'));
require('./sockets/notification')(io.of('/notification'));

// Start server
module.exports = http.listen(port, () => {
    console.log(`App is listening on port ${port}`);
}).on('error', (err) => {
    console.error("Failed to start server:", err);
});