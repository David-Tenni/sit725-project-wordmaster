const wordModel = require('../models/word');
const { client } = require('../models/connection');
const db = client.db('authentication');


async function getUserAnsweredCategories(username) {
    try {
        const user = await db.collection('users').findOne({ username });
        return user?.answers ? Object.keys(user.answers) : [];
    } catch(error) {
        console.error('Error getting user answered categories:', error);
        return [];
    }
}

async function selectCategories(numberOfCategories, gameType = null, username = null) {
    try {
        // Get answer counts for all categories
        const categoryCounts = await wordModel.getCategoryAnswerCounts();
        
        // Sort categories by count
        const sortedCategories = Object.entries(categoryCounts)
            .sort(([,a], [,b]) => b - a); // Sort by count in descending order

        // If no categories found, return a safe default
        if (!sortedCategories.length) {
            return ['Geography', 'Science', 'History', 'Entertainment', 'Animals']
                .slice(0, numberOfCategories);
        }

        // Split into popular and unpopular categories
        const popularCategories = sortedCategories
            .slice(0, Math.floor(sortedCategories.length / 2))
            .map(([category]) => category);
            
        const unpopularCategories = sortedCategories
            .slice(Math.floor(sortedCategories.length / 2))
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
            // For new users or non-logged in users, mix popular and unpopular categories
            const numPopular = Math.ceil(numberOfCategories * 0.6); // 60% popular categories
            const numUnpopular = numberOfCategories - numPopular; // Remaining unpopular categories

            selectedCategories = [
                ...getRandomElements(popularCategories, numPopular),
                ...getRandomElements(unpopularCategories, numUnpopular)
            ];
        }

        // If specific game type selected, filter categories accordingly
        if (gameType) {
            const gameTypeCategories = selectedCategories.filter(cat => 
                cat.toLowerCase().startsWith(gameType.toLowerCase())
            );

            // If we don't have enough categories after filtering, fill with others
            if (gameTypeCategories.length < numberOfCategories) {
                const otherCategories = selectedCategories
                    .filter(cat => !cat.toLowerCase().startsWith(gameType.toLowerCase()));
                
                return [
                    ...gameTypeCategories,
                    ...getRandomElements(otherCategories, numberOfCategories - gameTypeCategories.length)
                ];
            }

            return gameTypeCategories.slice(0, numberOfCategories);
        }

        // Ensure we return exactly the number of categories requested
        return selectedCategories.slice(0, numberOfCategories);

    } catch(error) {
        console.error('Error selecting categories:', error);
        // Return default categories in case of error
        return ['Geography', 'Science', 'History', 'Entertainment', 'Animals']
            .slice(0, numberOfCategories);
    }
}

// Helper function to get random elements from an array
function getRandomElements(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// function getRandomElements(array, count) {
//     const shuffled = array.sort(() => 0.5 - Math.random());
//     return shuffled.slice(0, count);
// }


module.exports = {
    selectCategories
};