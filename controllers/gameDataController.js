const gameData = require('../models/gameData');

const getRandomCategories = async (req, res) => {
    let game = req.params.game;
    if(!["History", "Entertainment", "Geography", "Science", "Animals"].includes(game)) game = null;

    try {
        console.log('getRandomCategories called with params:', req.params);
        const number = parseInt(req.params.number);
        if (isNaN(number)) return  res.status(400).json({ message: 'number must be a number' });
        
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

const getRandomUsers = async (req, res) => {
    try {
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