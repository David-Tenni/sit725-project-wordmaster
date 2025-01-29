let db = require('../models/word');

//get all word in a category
async function getWords(req,res) {
    // get parameters and validate them
    let category = req.params.category;
    if (!category) return res.status(400).json({ message: 'Word category is missing in path' });

    let isCategory = await db.isCategory(category);
    if(!isCategory) return res.status(404).json({message:"Category not found"});

    //make database call and respond
    db.getWords(category, (error,result)=>{
        if (!error) {
            res.status(200).json({data:result,message:'Word list successfully retrieved'});
        }
        else{
            res.status(500).json({message:error.message});
        }
    });
}

//get list of all categories
const getCategories = (req,res) => {
    //make database call and respond
    db.getCategories((error,result)=>{
        if (!error) {
            res.status(200).json({data:result,message:'Category list successfully retrieved'});
        }
        else{
            res.status(500).json({message:error.message});
        }
    });
}

//add to the count property of a word when someone uses it so that we can keep track of how rare the word is
async function addCount(req, res){
    // get parameters and validate them
    let { category, word } = req.body;
    if(!category || !word) return res.status(400).json({message:"Answer must contain category and word"});
    
    //make database call and respond
    db.addWordCount(word, category, (error)=>{
        if(!error){
            res.status(201).json({message:'Word count updated'});
        }
        else{
            res.status(500).json({message:error.message});
        }
    });
}

module.exports = {getWords,getCategories,addCount}