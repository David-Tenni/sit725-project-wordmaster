const gameData = require('../models/gameData');
const categorySelector = require('./categorySelectionController');
//get a list of random categories
const getRandomCategories = async (req, res) => {
    try {
        console.log('getRandomCategories called with params:', req.params);
        const number = parseInt(req.params.number);
        if (isNaN(number)) {
            return res.status(400).json({ message: 'number must be a number' });
        }
        
        const game = req.params.game;
        const username = req.user?.username;

        const categories = await categorySelector.selectCategories(number, game, username);
        
        // Ensure we have categories before proceeding
        if (!categories || !categories.length) {
            return res.status(500).json({ message: 'No categories available' });
        }

        res.status(200).json({
            data: categories,
            message: 'Category list successfully retrieved'
        });
    } catch (error) {
        console.error('Error getting categories:', error);
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