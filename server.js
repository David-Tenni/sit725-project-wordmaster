var express = require("express")
var app = express()

app.use(express.static(__dirname)) 
app.use(express.static(__dirname+'/views'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var wordsApiRoutes = require('./routers/wordsRouter');


var port = process.env.port || 3000;

app.use('/api/word', wordsApiRoutes);

app.listen(port,()=>{
console.log("App listening to: "+port)
})