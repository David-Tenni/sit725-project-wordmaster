let db = require('../models/gameData');

const getRandomCategories = (req,res) => {
    const number = req.params.number;

    db.getRandomCategories(+number, (error,result)=>{
        if (!error) {
            res.status(200).json({data:result,message:'Category list successfully retrieved'});
        }
        else{
            res.status(500).json({message:error.message});
        }
    });
}

const getRandomUsers = (req,res) => {
    const categories = req.body.categories;
    const number = req.params.number;

    db.getRandomUsers(categories, +number, (error,result)=>{
        if (!error) {
            res.status(200).json({data:result,message:'Rounds successfully retrieved'});
        }
        else{
            res.status(500).json({message:error.message});
        }
    });
}

module.exports = {getRandomCategories, getRandomUsers}