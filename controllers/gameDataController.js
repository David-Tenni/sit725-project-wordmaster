const gameData = require('../models/gameData');
const categorySelector = require('./categorySelectionController');

const getRandomCategories = async (req, res) => {
    try {
        // console.log('getRandomCategories called with params:', req.params);
        const number = parseInt(req.params.number);
        if (isNaN(number)) {
            return res.status(400).json({ message: 'number must be a number' });
        }

        const game = req.params.game;
        const username = req.user?.username;

        // Only use new category selector for main Play button 
        if (!game) {
            try {
                const categories = await categorySelector.selectCategories(number, null, username);
                return res.status(200).json({
                    data: categories,
                    message: 'Category list successfully retrieved'
                });
            } catch (error) {
                console.error('Error in category selector:', error);
                return res.status(500).json({ message: 'Error getting categories' });
            }
        }

        // For specific categories old logic
        if (!["History", "Entertainment", "Geography", "Science", "Animals"].includes(game)) {
            return res.status(400).json({ message: 'Invalid game category' });
        }

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
        const number = parseInt(req.params.number);
        const {categories} = req.body;
        if (!categories || !Array.isArray(categories)) {
            return res.status(400).json({ 
                message: 'Request must include categories' 
            });
        }

        gameData.getRandomUsers(categories, number, username, (userError, rounds) => {
            if (userError) {
                console.error('User error:', userError);
                return res.status(500).json({ message: userError.message });
            }
            
            // console.log('Successfully got rounds:', rounds.length);
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