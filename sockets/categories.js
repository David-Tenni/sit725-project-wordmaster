const { client } = require('../models/connection');

module.exports = function(io) {
    io.on('connection', (socket) => {
        //console.log('User connected');

        let interval;
        let queryPending = false;

        async function getLongestWordForEachCategory() {
            let categories = await client.db("words").listCollections().toArray();
            let collection = client.db('authentication').collection("users");
            let result = [];
        
            for (const category of categories) {
                const answers = await collection.aggregate([
                    { 
                        $match: { [`answers.${category.name}`]: { $exists: true } } 
                    },
                    {
                        $project: {
                            username: 1,
                            word: { $ifNull: [`$answers.${category.name}.word`, ''] }
                        }
                    }
                ]).toArray();
        
                let longestAnswer = answers
                    .map(answer => ({
                        ...answer,
                        simplified: answer.word.replace(/[\s\W_]+/g, '')
                    }))
                    .reduce((max, current) => current.simplified.length > max.simplified.length ? current : max);
        
                result.push({
                    category: category.name,
                    username: longestAnswer.username,
                    word: longestAnswer.word
                });
            }
        
            return result;
        }

        // Start emitting data
        const startEmitting = () => {
            interval = setInterval(async () => {
                if (queryPending) return;

                queryPending = true;

                try {
                    let categories = await getLongestWordForEachCategory();
                    let filtered = categories.map(cat => ({ category: cat.category, username: cat.username, word: cat.word }));
                    socket.emit('Categories', filtered);
                    //console.log('Emitting categories:', filtered );
                } catch (error) {
                    console.error("Error fetching categories:", error);
                } finally {
                    queryPending = false;
                }
            }, 100);
        };

        if (!interval) {
            startEmitting();
        }

        socket.on('disconnect', () => {
            clearInterval(interval);
        });
    });
};