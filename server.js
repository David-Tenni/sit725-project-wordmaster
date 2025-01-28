var express = require("express")
var app = express()
let http = require('http').createServer(app);
let io = require('socket.io')(http);
const path = require('path');
require('dotenv').config();
const fs = require('fs');

// Import controllers and routers
const userController = require('./controllers/userController');
const userProfileRouter = require('./routers/userProfileRouter');
const wordLengthSocket = require('./sockets/wordLength');
const totalScoreSocket = require('./sockets/totalScore');
const highScoreSocket = require('./sockets/highScore');
const winsSocket = require('./sockets/wins');
const categoriesSocket = require('./sockets/categories');
const notificationSocket = require('./sockets/notification');

// Default route
app.get('/', (req, res) => {
    res.redirect('/mainMenu.html');
});

// Static file serving
app.use(express.static(__dirname)) 
app.use(express.static(__dirname+'/views'))

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
app.use('/user', userProfileRouter);
app.get('/api/user/:username', userController.getUserByUsername);

// Socket Setup
wordLengthSocket(io.of('/word_length'));
totalScoreSocket(io.of('/total_score'));
highScoreSocket(io.of('/high_score'));
winsSocket(io.of('/wins'));
categoriesSocket(io.of('/categories'));
notificationSocket(io.of('/notification'));

module.exports = http.listen(port, () => {
    console.log(`App is listening on port ${port}`);
}).on('error',(err) => {
    console.error("Failed to start server:", err);
});