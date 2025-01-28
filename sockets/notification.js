const client = require('../models/connection');
const jwt = require("jsonwebtoken");

module.exports = function(io) {
    io.on("connection", (socket) => {
        socket.on("authenticate", (token) => {
            jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (error, result) => {
                if (error){
                    console.log(error);
                }else{
                    socket.username = result.username;
                }
            });

            async function getRankings() {
                let collection = client.db('authentication').collection("users");
                const rankedUsers = await collection.aggregate([
                    {
                        $sort: { high_score: -1 }
                    }
                    ]).toArray();
    
                return rankedUsers;
            }

            let previous = 0;
            const interval = setInterval(async () => {
                let ranking = await getRankings();
                let rank = ranking.findIndex(user => user.username === socket.username) + 1;
                if(previous != 0 && rank != 0){
                    if(rank > previous){
                        socket.emit("alert", `Your high score has been surpassed!`);
                    }
                }
                previous = rank;
            }, 10000);

            socket.on("disconnect", () => {
                clearInterval(interval);
            });
        });
    });
};