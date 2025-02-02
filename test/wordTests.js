require('./dbMock');

const {getWords,getCategories,isCategory,addWordCount,getCategoryAnswerCounts} = require('../models/word');

module.exports = () => {
    describe("Testing Word model", () => {
        let mockCallback;

        beforeEach(() => {
          mockCallback = jest.fn();
        });

        describe("Testing getWords function", () => {
            it('should return category lists in the right order', async () => {
                await getWords(["domesticated_animals"], mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(null, {domesticated_animals: [{word:'Cat'}, {word:'Dog'}, {word:'Cow'}, {word:'Horse'}]});
            });
            it('should return an error if categories is not an array', async () => {
                await getWords("domesticated_animals", mockCallback);

                expect(mockCallback).toHaveBeenCalledWith({ message: "Error getting word lists" }, null);
            });
        });

        describe("Testing getCategoryAnswerCounts function", () => {
            it('should return categories with their counts', async () => {
                let result = await getCategoryAnswerCounts();

                expect(result).toEqual({
                    domesticated_animals: 5,
                    dog_breeds: 5,
                    bird_species: 5,
                    autralian_prime_ministers: 5,
                    ancient_greek_philosophers: 5
                    });
            });
        });

        describe("Testing getCategories function", () => {
            it('should return categories without underscores', async () => {
                await getCategories(mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(null, ['domesticated animals', "dog breeds", "bird species", "autralian prime ministers", "ancient greek philosophers" ]);
            });
        });

        describe("Testing addWordCount function", () => {
            it('should return with an error if word is not a normal word', async () => {
                await addWordCount(2, 'domesticated_animals', mockCallback);

                expect(mockCallback).toHaveBeenCalledWith({message: "Error updating the word count"});
            });
            it('should return without an error if everything is good', async () => {
                await addWordCount('pig', 'domesticated_animals', mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(null);
            });
        });

        describe("Testing isCategory function", () => {
            it('should return true if it is a category', async () => {
                result = await isCategory("domesticated_animals");

                expect(result).toEqual(true);
            });
            it('should return false if it is not a category', async () => {
                result = await isCategory("wild_animals");

                expect(result).toEqual(false);
            });
        });
    });
}