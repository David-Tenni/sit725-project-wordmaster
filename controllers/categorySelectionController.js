const wordModel = require('../models/word');
const client = require('../models/connection');
const db = client.db('authentication');

async function selectCategories(numberOfCategories, gameType = null, username = null) {
    try {
        // Get answer counts for all categories
        const categoryCounts = await wordModel.getCategoryAnswerCounts();
        
        // If no categories found, return a safe default
        if (!Object.keys(categoryCounts).length) {
            console.log('No categories found, using fallback');
            return ['Geography', 'Science', 'History', 'Entertainment', 'Animals']
                .slice(0, numberOfCategories);
        }
        // Split into popular and unpopular categories
        const popularCategories = sortedCategories.slice(0, Math.floor(sortedCategories.length / 2))
            .map(([category]) => category);
        const unpopularCategories = sortedCategories.slice(Math.floor(sortedCategories.length / 2))
            .map(([category]) => category);

        let selectedCategories = [];

        if (username) {
            // Get user's answered categories
            const userAnswers = await getUserAnsweredCategories(username);
            
            // For returning users, prioritize unanswered categories
            const unansweredCategories = Object.keys(categoryCounts)
                .filter(category => !userAnswers.includes(category));
            
            if (unansweredCategories.length >= numberOfCategories) {
                // If enough unanswered categories exist, use those
                selectedCategories = getRandomElements(unansweredCategories, numberOfCategories);
            } else {
                // Mix unanswered with some answered categories
                selectedCategories = [
                    ...unansweredCategories,
                    ...getRandomElements(userAnswers, numberOfCategories - unansweredCategories.length)
                ];
            }
        } else {
            // For new users or non-logged in users
            selectedCategories = [
                ...getRandomElements(popularCategories, 3),
                ...getRandomElements(unpopularCategories, 2)
            ];
        }

        // If specific game type selected, filter categories accordingly
        if (gameType) {
            selectedCategories = selectedCategories.filter(cat => 
                cat.startsWith(gameType.toLowerCase()));
        }

        return selectedCategories;
    } catch(error) {
        console.error('Error selecting categories:', error);
        throw error;
    }
}

function getRandomElements(array, count) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

async function getUserAnsweredCategories(username) {
    // Get categories user has already answered from user model
    const user = await db.collection('users').findOne({ username });
    return user?.answers ? Object.keys(user.answers) : [];
}

module.exports = {
    selectCategories
};