const client = require('../models/connection');

module.exports = function(io) {
    io.on('connection', (socket) => {
        //console.log('User connected');

        async function getUserByHighScore() {
            let collection = client.db('authentication').collection("users");
            const rankedUsers = await collection.aggregate([
                {
                    $sort: { high_score: -1 }
                }
                ]).toArray();

            return rankedUsers;
        }


        const interval = setInterval(async () => {
            let users = await getUserByHighScore()
            let filtered = users.map(user => ({ username: user.username, high_score: user.high_score ? user.high_score : 0 }));
            socket.emit('Users_by_high_score', filtered);
            //console.log('Emitting:', filtered);
        }, 100);

        socket.on('disconnect', () => {
            //console.log('User disconnected');
            clearInterval(interval);
        });
    });
};