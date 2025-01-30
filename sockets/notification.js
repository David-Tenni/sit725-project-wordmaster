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

            function findSurpassingUser(prev, cur){
                const length = Math.min(prev.length, cur.length);

                for (let i = 0; i < length; i++) {
                    
                    if (prev[i].username != cur[i].username) {
                        return cur[i];
                    }
                }
                return -1;
            }

            let previous = 0;
            let previousRanking = null;
            const interval = setInterval(async () => {
                let ranking = await getRankings();
                let rank = ranking.findIndex(user => user.username === socket.username) + 1;
                if(previous != 0 && rank != 0){
                    if(rank > previous){
                        const surpassingUser = findSurpassingUser(previousRanking, ranking);
                        socket.emit("alert", `Your high score has been surpassed by ${surpassingUser.username}!`);
                    }
                }
                previous = rank;
                previousRanking = ranking;
            }, 1000);

            socket.on("disconnect", () => {
                clearInterval(interval);
            });
        });
    });
};