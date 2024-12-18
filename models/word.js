let client = require('./connection');

let db = client.db('words')

async function postWord(category, word, callback) {
    collection = db.collection(category);
    const result = await collection.insertOne(word);
    callback(null, result);
}

async function getWords(category, callback) {
    collection = db.collection(category);
    const result = await collection.find({}).toArray();
    callback(null, result);
}

module.exports = {getWords,postWord}