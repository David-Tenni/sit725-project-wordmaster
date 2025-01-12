const client = require('./connection');
const db = client.db('words');
const collection = client.db('authentication').collection("users");

// Get random categories from the words database
async function getRandomCategories(number, callback) {
    try {
        console.log('Getting random categories, number:', number);
        const categories = await db.listCollections().toArray();
        const names = categories.map(category => category.name);
        const randomCategories = names
            .sort(() => Math.random() - 0.5)
            .slice(0, number);
        
        console.log('Selected categories:', randomCategories);
        callback(null, randomCategories);
    } catch (error) {
        console.error('Error getting categories:', error);
        callback({ message: "Error getting categories list" }, null);
    }
}

// Get random users with answers for given categories
async function getRandomUsers(categories, number, username, callback) {
    try {
        if (!categories || !Array.isArray(categories)) {
            console.error('Invalid categories:', categories);
            throw new Error('Categories must be an array');
        }

        console.log('Getting random users:', { categories, number });

        let match = categories.map(category => ({ [`answers.${category}`]: { $exists: true } }));

        if(username) {
            match.push({ username: { $ne: username } });
        }

        //match = {$and: match}

        const players = await collection.aggregate([
            { $match: {$and: match} },
            { $sample: { size: parseInt(number) } }
        ]).toArray();

        console.log('Found players:', players.length);

        let rounds = categories.map(category => ({
            category: category,
            answers: players.reduce((answers, player) => {
                if (player.answers && player.answers[category]) {
                    answers[player.username] = {
                        word: player.answers[category].word,
                        time: player.answers[category].time
                    };
                }
                return answers;
            }, {})
        }));

        console.log('Generated rounds:', JSON.stringify(rounds, null, 2));
        callback(null, rounds);
    } catch (error) {
        console.error('Error getting users:', error);
        callback({ message: "Error getting players" }, null);
    }
}

// Export as an object with named functions
module.exports = {
    getRandomCategories,
    getRandomUsers
};