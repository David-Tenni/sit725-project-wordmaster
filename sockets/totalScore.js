const { client } = require('../models/connection');

module.exports = function(io) {
    io.on('connection', (socket) => {
        //console.log('User connected');

        async function getUserByTotalScore() {
            let collection = client.db('authentication').collection("users");
            const rankedUsers = await collection.aggregate([
                {
                    $sort: { total_score: -1 }
                }
                ]).toArray();

            return rankedUsers;
        }


        const interval = setInterval(async () => {
            let users = await getUserByTotalScore()
            let filtered = users.map(user => ({ username: user.username, total_score: user.total_score ? user.total_score : 0 }));
            socket.emit('Users_by_total_score', filtered);
            //console.log('Emitting:', filtered);
        }, 100);

        socket.on('disconnect', () => {
            // console.log('User disconnected');
            clearInterval(interval);
        });
    });
};