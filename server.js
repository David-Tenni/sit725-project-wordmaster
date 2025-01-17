var express = require("express")
var app = express()
let http = require('http').createServer(app);
let io = require('socket.io')(http);
app.get('/', (req, res) => {
    res.redirect('/mainMenu.html');
});

app.use(express.static(__dirname)) 
app.use(express.static(__dirname+'/views'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var wordsApiRoutes = require('./routers/wordsRouter');
var usersApiRoutes = require('./routers/usersRouter');
var gameDataApiRoutes = require('./routers/gameDataRouter');

var port = process.env.PORT || 3000;

app.use('/api/word', wordsApiRoutes);
app.use('/api/user', usersApiRoutes);
app.use('/api/game', gameDataApiRoutes);

const wordLengthSocket = require('./sockets/wordLength');
const totalScoreSocket = require('./sockets/totalScore');
const highScoreSocket = require('./sockets/highScore');
const winsSocket = require('./sockets/wins');
const categoriesSocket = require('./sockets/categories');
wordLengthSocket(io.of('/word_length'));
totalScoreSocket(io.of('/total_score'));
highScoreSocket(io.of('/high_score'));
winsSocket(io.of('/wins'));
categoriesSocket(io.of('/categories'));

module.exports = http.listen(port, () => {
    console.log(`App is listening on port ${port}`);
}).on('error',(err) => {
    console.error("Failed to start server:", err);
});

