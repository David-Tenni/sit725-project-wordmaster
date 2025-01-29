const gameData = require('../models/gameData');

//get a list of random categories
const getRandomCategories = async (req, res) => {
    //check if game is specified and is correct and use null otherwise
    let game = req.params.game;
    if(!["History", "Entertainment", "Geography", "Science", "Animals"].includes(game)) game = null;

    try {
        //get the number of desired categoires
        console.log('getRandomCategories called with params:', req.params);
        const number = parseInt(req.params.number);
        if (isNaN(number)) return  res.status(400).json({ message: 'number must be a number' });
        
        //make database call and respond
        gameData.getRandomCategories(number, game, (error, result) => {
            if (error) {
                console.error('Categories error:', error);
                return res.status(500).json({ message: error.message });
            }
            
            res.status(200).json({
                data: result,
                message: 'Category list successfully retrieved'
            });
        });
    } catch (error) {
        console.error('Unexpected error in getRandomCategories:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//get random players for a specific list of categories
const getRandomUsers = async (req, res) => {
    try {
        //get current user (if ther is one), the number of players wanted and the categories
        let username = req.user?.username;
        console.log('getRandomUsers called with params:', req.params);
        const number = parseInt(req.params.number);
        const {categories} = req.body;

        // Then get random users for those categories
        gameData.getRandomUsers(categories, number, username, (userError, rounds) => {
            if (userError) {
                console.error('User error:', userError);
                return res.status(500).json({ message: userError.message });
            }

            console.log('Successfully got rounds:', rounds.length);
            res.status(200).json({
                data: rounds,
                message: 'Players successfully retrieved'
            });
        });
    } catch (error) {
        console.error('Unexpected error in getRandomUsers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getRandomCategories,
    getRandomUsers
};