require('./dbMock');

const { getRandomCategories, getRandomUsers } = require('../models/gameData');

module.exports = () => {
    describe("Testing Game data model", () => {
        let mockCallback;

        beforeEach(() => {
          mockCallback = jest.fn();
        });

        describe("Testing getRandomCategories function", () => {
            it('should return the correct numbere of categories', async () => {
                await getRandomCategories(3, null, mockCallback);

                const resultArray = mockCallback.mock.calls[0][1];
                expect(resultArray).toHaveLength(3);
            });


            it('should return the correct categories if the game type is specified', async () => {
                await getRandomCategories(2, "History", mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(null, expect.arrayContaining([
                    "australian_prime_ministers", 
                    "ancient_greek_philosophers"
                ]));
            });

            it('should return the correct categories if the game type is not specified', async () => {
                await getRandomCategories(5, null, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(null, expect.arrayContaining([
                    'domesticated_animals',
                    "dog_breeds",
                    "bird_species",
                    "autralian_prime_ministers",
                    "ancient_greek_philosophers"
                ]));
            });

            it('should return with an error if game is not a real game type', async () => {
                await getRandomCategories(5, "Sports", mockCallback);

                expect(mockCallback).toHaveBeenCalledWith({ message: "Error getting categories list" }, null);
            });
        });

        describe("Testing getRandomUsers function", () => {

            it('should return with an error if categories are null', async () => {
                await getRandomUsers(null, 5, null, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith({ message: "Error getting players" }, null);
            });
            it('should respond successfully with both users', async () => {
                await getRandomUsers(['domesticated_animals'], 2, null, mockCallback);

                const resultArray = mockCallback.mock.calls[0][1][0].answers;
                expect(Object.keys(resultArray)).toHaveLength(2);
            });
        });
    });
}