let client = require('./connection');

let db = client.db('words')

async function getWords(category, callback) {
    try{
        collection = db.collection(category);
        const result = await collection.find({}).toArray();
        callback(null, result);
    }catch(error){
        callback({message: "Error getting word list"}, null);
    }
}

async function getCategories(callback){
    try{
        const categories = await db.listCollections().toArray();
        const result =  categories.map(category => category.name.replaceAll('_', ' '));
        callback(null, result);
    }catch(error){
        callback({message: "Error getting categories list"}, null);
    }
}

async function isCategory(category){
    try{
        const categories = await db.listCollections().toArray();
        const result =  categories.map(category => category.name);
        return result.includes(category);
    }catch(error){
        callback({message: "Error getting categories list"}, null);
    }
}

module.exports = {getWords,getCategories,isCategory}