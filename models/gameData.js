let client = require('./connection');

let db = client.db('words')

async function getRandomCategories(number, callback){
    try{
        const categories = await db.listCollections().toArray();
        const names =  categories.map(category => category.name);
        const randomCategories = names
            .sort(() => Math.random()-0.5)
            .slice(0, number);
        callback(null, randomCategories);
    }catch(error){
        callback({message: "Error getting categories list"}, null);
    }
}


let collection = client.db('authentication').collection("users");

async function getRandomUsers(categories, number, callback){
    try{
        const match = {
            $and: categories.map(category => ({ [`answers.${category}`]: { $exists: true } }))
        };
        
        const players = await collection.aggregate([
            { $match: match },
            { $sample: { size: number } }
        ]).toArray();

        let rounds = categories.map(category => ({
            category: category,
            answers: players.reduce((answers, player) => {
                answers[player.username] = {
                    word: player.answers[category].word,
                    time: player.answers[category].time
                };
                return answers;
            }, {})
        }));

        callback(null, rounds);
    }catch(error){
        callback({message: "Error getting players"}, null);
    }
}

module.exports = {getRandomCategories, getRandomUsers}