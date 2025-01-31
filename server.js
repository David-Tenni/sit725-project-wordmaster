var express = require("express");
var app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
const path = require('path');
require('dotenv').config();
const fs = require('fs');

// Favicon route (place this at the top)
app.use('/favicon.ico', (req, res) => {
    console.log('Favicon requested');
    const faviconPath = path.join(__dirname, 'views', 'img', 'logo.ico');
    console.log('Favicon path:', faviconPath); // Debugging line
    if (fs.existsSync(faviconPath)) {
        res.sendFile(faviconPath);
    } else {
        res.status(404).send('Favicon not found');
    }
});

// Static file serving (place this AFTER the favicon route)
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'views')));

// Default route
app.get('/', (req, res) => {
    res.redirect('/mainMenu.html');
});

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

// User Profile Routes
app.use('/user', require('./routers/userProfileRouter'));
app.get('/api/user/:username', require('./controllers/userController').getUserByUsername);

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