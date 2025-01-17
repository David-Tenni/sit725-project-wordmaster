const client = require('../models/connection');

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('User connected');
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });

        async function getUserByTotalScore() {
            let collection = client.db('authentication').collection("users");
            const rankedUsers = await collection.aggregate([
                {
                    $sort: { total_score: -1 }
                }
                ]).toArray();

            return rankedUsers;
        }


        setInterval(async () => {
            let users = await getUserByTotalScore()
            let filtered = users.map(user => ({ username: user.username, total_score: user.total_score ? user.total_score : 0 }));
            socket.emit('Users_by_total_score', filtered);
            //console.log('Emitting:', filtered);
        }, 1000);
    });
};