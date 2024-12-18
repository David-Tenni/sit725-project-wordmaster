let db = require('../models/word');

const getWords = (req,res) => {
    let category = req.params.category;
    if (!category) return res.json({ statusCode: 400, message: 'Word category is missing in path' });

    db.getWords(category, (error,result)=>{
        if (!error) {
            res.json({statusCode:200,data:result,message:'success'});
        }
    });
}

const postWord = (req, res) => {

    let category = req.params.category;
    if (!category) return res.json({ statusCode: 400, message: 'Word category is missing in path' });

    let wordToAdd = req.body;
    if (!wordToAdd?.word) return res.json({ statusCode: 400, message: 'New word to add is missing in body' });

    db.postWord(category, wordToAdd, (error, result) => {
        if (!error) {
            res.json({ statusCode:201,data:result,message:'New word added'});
        }
    });
};

module.exports = {getWords,postWord}