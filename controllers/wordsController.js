let db = require('../models/word');

async function getWords(req,res) {
    let category = req.params.category;
    if (!category) return res.status(400).json({ message: 'Word category is missing in path' });

    let isCategory = await db.isCategory(category);
    if(!isCategory) return res.status(404).json({message:"Category not found"});

    db.getWords(category, (error,result)=>{
        if (!error) {
            res.status(200).json({data:result,message:'Word list successfully retrieved'});
        }
        else{
            res.status(500).json({message:error.message});
        }
    });
}

const getCategories = (req,res) => {
    db.getCategories((error,result)=>{
        if (!error) {
            res.status(200).json({data:result,message:'Category list successfully retrieved'});
        }
        else{
            res.status(500).json({message:error.message});
        }
    });
}

module.exports = {getWords,getCategories}