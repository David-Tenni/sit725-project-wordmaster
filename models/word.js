let { client } = require('./connection');  
let db = client.db('words')

// get all words in a category
async function getWords(categories, callback) {
    try {
        const results = await Promise.all(categories.map(async (category) => {
            const collection = db.collection(category);
            const words = await collection.find({}).toArray();
            return { category, words };
        }));
        
        const labeled = results.reduce((final, { category, words }) => {
            final[category] = words;
            return final;
        }, {});

        callback(null, labeled);
    } catch (error) {
        callback({ message: "Error getting word lists" }, null);
    }
}
// checks for valid awnswers in a category
async function getCategoryAnswerCounts() {
    try {
        let categories = await db.listCollections().toArray();
        let counts = {};
        
        for (const category of categories) {
            const collection = db.collection(category.name);
            // Count documents that have been answered (count > 0)
            const count = await collection.countDocuments({ count: { $gt: 0 } });
            counts[category.name] = count;
        }
        return counts;
    } catch(error) {
        console.error('Error getting category counts:', error);
        throw error;
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

module.exports = {getWords,getCategories,isCategory,addWordCount,getCategoryAnswerCounts}