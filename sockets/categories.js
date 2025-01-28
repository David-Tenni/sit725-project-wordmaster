const client = require('../models/connection');

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('User connected');

        async function getLongestWordForEachCategory() {
            let categories = await client.db("words").listCollections().toArray();
            let collection = client.db('authentication').collection("users");
            let result = [];

            for(const category of categories){
                const highest = await collection.aggregate([
                    { 
                        $match: { [`answers.${category.name}`]: { $exists: true } } 
                    },
                    {
                        $project: {
                            username: 1,
                            word: { $ifNull: [`$answers.${category.name}.word`, ''] },
                            length: { $strLenCP: { $ifNull: [`$answers.${category.name}.word`, ''] } },
                        }
                    },
                    { 
                        $sort: { length: -1 } 
                    },
                    { 
                        $limit: 1 
                    }
                ]).toArray();

                result.push({
                    category: category.name,
                    username: highest[0].username,
                    word: highest[0].word
                })
            }
            return result;
        }


        const interval = setInterval(async () => {
            let categories = await getLongestWordForEachCategory()
            let filtered = categories.map(cat => ({ category: cat.category, username: cat.username, word: cat.word }));
            socket.emit('Categories', filtered);
            //console.log('Emitting:', filtered);
        }, 10000);

        socket.on('disconnect', () => {
            console.log('User disconnected');
            clearInterval(interval);
        });
    });
};