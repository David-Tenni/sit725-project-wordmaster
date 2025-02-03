require('./dbMock');
const CategorySelectionController = require('../controllers/categorySelectionController');

module.exports = () => {
    describe('Testing Category Selection Controller', () => {
        let mockSocket;
        
        beforeEach(() => {
            // Create a mock socket with custom implementation
            mockSocket = {
                emit: jest.fn(),
                on: jest.fn(),
                removeAllListeners: jest.fn()
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

        it('should handle category selection with valid categories', () => {
            const categories = ['category1', 'category2'];
            
            // Attempt to call selectCategories and ensure no error
            expect(() => {
                CategorySelectionController.selectCategories(categories, mockSocket);
            }).not.toThrow();
        });

        it('should handle empty category list', () => {
            const categories = [];
            
            // Attempt to call with empty categories and ensure no error
            expect(() => {
                CategorySelectionController.selectCategories(categories, mockSocket);
            }).not.toThrow();
        });

        it('should handle null socket parameter', () => {
            const categories = ['category1'];
            
            // Attempt to call with null socket and ensure no error
            expect(() => {
                CategorySelectionController.selectCategories(categories, null);
            }).not.toThrow();
        });

        it('should handle invalid category selection', () => {
            const categories = ['category1'];
            
            // Setup
            CategorySelectionController.selectCategories(categories, mockSocket);
            
            // Simulate event handling
            const onCalls = mockSocket.on.mock.calls;
            const selectCategoryHandler = onCalls.find(
                call => call[0] === 'select_category'
            );
            
            // If a handler exists, call it with invalid data
            if (selectCategoryHandler) {
                expect(() => {
                    selectCategoryHandler[1]({ selectedCategory: 'invalid_category' });
                }).not.toThrow();
            }
        });

        it('should handle category selection with game state', () => {
            const categories = ['category1'];
            
            // Setup
            CategorySelectionController.selectCategories(categories, mockSocket);
            
            // Simulate event handling
            const onCalls = mockSocket.on.mock.calls;
            const selectCategoryHandler = onCalls.find(
                call => call[0] === 'select_category'
            );
            
            // If a handler exists, call it with game state
            if (selectCategoryHandler) {
                expect(() => {
                    selectCategoryHandler[1]({ 
                        selectedCategory: 'category1',
                        gameState: {
                            currentRound: 1,
                            totalScore: 100
                        }
                    });
                }).not.toThrow();
            }
        });
    });
};