const client = require('../models/connection');

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('User connected');
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });

        async function getUserByWins() {
            let collection = client.db('authentication').collection("users");
            const rankedUsers = await collection.aggregate([
                {
                    $sort: { wins: -1 }
                }
                ]).toArray();

            return rankedUsers;
        }


        setInterval(async () => {
            let users = await getUserByWins()
            let filtered = users.map(user => ({ username: user.username, wins: user.wins ? user.wins : 0 }));
            socket.emit('Users_by_wins', filtered);
            //console.log('Emitting:', filtered);
        }, 1000);
    });
};