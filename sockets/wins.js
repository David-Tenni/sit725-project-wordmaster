const { client } = require('../models/connection');

module.exports = function(io) {
    io.on('connection', (socket) => {
        //console.log('User connected');

        async function getUserByWins() {
            let collection = client.db('authentication').collection("users");
            const rankedUsers = await collection.aggregate([
                {
                    $sort: { wins: -1 }
                }
                ]).toArray();

            return rankedUsers;
        }


        const interval = setInterval(async () => {
            let users = await getUserByWins()
            let filtered = users.map(user => ({ username: user.username, wins: user.wins ? user.wins : 0 }));
            socket.emit('Users_by_wins', filtered);
            //console.log('Emitting:', filtered);
        }, 100);

        socket.on('disconnect', () => {
            // console.log('User disconnected');
            clearInterval(interval);
        });
    });
};