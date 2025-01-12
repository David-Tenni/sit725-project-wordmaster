const gameData = require('../models/gameData');

const getRandomCategories = async (req, res) => {
    try {
        console.log('getRandomCategories called with params:', req.params);
        const number = parseInt(req.params.number);

        gameData.getRandomCategories(number, (error, result) => {
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

        // First get random categories
        gameData.getRandomCategories(5, (categoryError, categories) => {
            if (categoryError) {
                console.error('Category error:', categoryError);
                return res.status(500).json({ message: categoryError.message });
            }

            console.log('Got categories for users:', categories);

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