var express = require("express")
var app = express()

app.use(express.static(__dirname)) 
app.use(express.static(__dirname+'/views'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var wordsApiRoutes = require('./routers/wordsRouter');
var usersApiRoutes = require('./routers/usersRouter');

var port = process.env.PORT || 3000;

app.use('/api/word', wordsApiRoutes);
app.use('/api/user', usersApiRoutes);

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
}).on('error',(err) => {
    console.error("Failed to start server:", err);
});