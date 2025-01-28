const client = require('../models/connection');

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('User connected');

        async function getUserByWordLength() {
            let collection = client.db('authentication').collection("users");
            const rankedUsers = await collection.aggregate([
                {
                    $project: {
                        username: 1,
                        longest_word: 1,
                        length: { $strLenCP: { $ifNull: ["$longest_word", ""] } }
                    }
                },
                {
                    $sort: { length: -1 }
                }
                ]).toArray();

            return rankedUsers;
        }

        const interval = setInterval(async () => {
            let users = await getUserByWordLength()
            let filtered = users.map(user => ({ username: user.username, longest_word: user.longest_word ? user.longest_word : '' }));
            socket.emit('Users_by_word_length', filtered);
            //console.log('Emitting:', filtered);
        }, 10000);

        socket.on('disconnect', () => {
            console.log('User disconnected');
            clearInterval(interval);
        });
    });
};