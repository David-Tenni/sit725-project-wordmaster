let client = require('./connection');

let db = client.db('words')

// get all words in a category
async function getWords(category, callback) {
    try{
        collection = db.collection(category);
        const result = await collection.find({}).toArray();
        callback(null, result);
    }catch(error){
        callback({message: "Error getting word list"}, null);
    }
}

//get a list of all categories
async function getCategories(callback){
    try{
        const categories = await db.listCollections().toArray();
        const result =  categories.map(category => category.name.replaceAll('_', ' '));
        callback(null, result);
    }catch(error){
        callback({message: "Error getting categories list"}, null);
    }
}

//update a word count when it is used
async function addWordCount(word, category, callback){
    try{
        //find the right collection
        const categoryList = db.collection(category);

        //simplify the word by removing uppercase, spaces and symbols
        const simplifiedWord = word.toLowerCase().replace(/[\s\W_]+/g, '');

        //increment the word count
        result = await categoryList.updateOne(
            { word: simplifiedWord },
            { $inc: { count: 1  } }
        );
        callback(null)
        
    }catch(error){
        callback({message: "Error updating the word count"})
    }
}

// check if a string is a category name
async function isCategory(category){
    try{
        const categories = await db.listCollections().toArray();
        const result =  categories.map(category => category.name);
        return result.includes(category);
    }catch(error){
        callback({message: "Error getting categories list"}, null);
    }
}

module.exports = {getWords,getCategories,isCategory,addWordCount}