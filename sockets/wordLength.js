const client = require('../models/connection');

module.exports = function(io) {
    io.on('connection', (socket) => {
        //console.log('User connected');

        async function getUserByWordLength() {
            let collection = client.db('authentication').collection("users");
            const rankedUsers = await collection.aggregate([
                {
                    $match: { longest_word: { $exists: true } }
                },
                {
                    $project: {
                        username: 1,
                        longest_word: 1
                    }
                }
            ]).toArray();


            rankedUsers.forEach(user => {
                user.length = user.longest_word.replace(/[\s\W_]+/g, '').length;
            });
            rankedUsers.sort((a, b) => b.length - a.length);

            return rankedUsers;
        }
        const interval = setInterval(async () => {
            let users = await getUserByWordLength()
            let filtered = users.map(user => ({ username: user.username, longest_word: user.longest_word ? user.longest_word : '' }));
            socket.emit('Users_by_word_length', filtered);
            //console.log('Emitting:', filtered);
        }, 100);

        socket.on('disconnect', () => {
            //console.log('User disconnected');
            clearInterval(interval);
        });
    });
};