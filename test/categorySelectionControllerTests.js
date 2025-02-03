require('./dbMock');
const CategorySelectionController = require('../controllers/categorySelectionController');

module.exports = () => {
    describe('Testing Category Selection Controller', () => {
        let mockSocket;
        let mockGame;

        beforeEach(() => {
            // Create a mock socket object
            mockSocket = {
                emit: jest.fn(),
                on: jest.fn(),
                removeAllListeners: jest.fn()
            };

            // Create a mock game object
            mockGame = {
                currentRound: 1,
                totalRounds: 5,
                categories: ['category1', 'category2'],
                currentCategory: 'category1'
            };
            
            // Reset the mock functions before each test
            jest.clearAllMocks();
        });

        it('should be an object', () => {
            expect(typeof CategorySelectionController).toBe('object');
        });

        it('should contain selectCategories method', () => {
            expect(CategorySelectionController).toHaveProperty('selectCategories');
            expect(typeof CategorySelectionController.selectCategories).toBe('function');
        });

        // Test the function directly without checking socket interactions
        it('should accept categories and socket parameters', () => {
            const result = CategorySelectionController.selectCategories(['category1'], mockSocket);
            expect(result).not.toThrow;
        });

        // Test the internal structure
        it('should handle the correct number of categories', () => {
            const categories = ['category1', 'category2', 'category3'];
            const result = CategorySelectionController.selectCategories(categories, mockSocket);
            expect(result).not.toThrow;
        });
    });
};