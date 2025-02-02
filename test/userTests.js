require('./dbMock');

const {getUser,postUser,updateUserAnswer,updateUserPassword,deleteUser,addRefreshToken,findRefreshToken, postUserGame} = require('../models/user');

module.exports = () => {
    describe("Testing User model", () => {
        let mockCallback;

        beforeEach(() => {
          mockCallback = jest.fn();
        });

        describe("Testing getUser function", () => {
            it('should return an undefined user if user does not exist', async () => {
                await getUser("user", mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(null, undefined);
            });
            it('should return the user successfully if it does exist', async () => {
                await getUser("TestUser", mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(null,                 {
                    username:'TestUser',
                    password:'TestPass',
                    token:'Token',
                    answers: {
                        domesticated_animals: {word:"dog",time:4000}, 
                        dog_breeds: {word: "beagle", time: 4000},
                        autralian_prime_ministers: {word: "Anthony Albanese", time: 3900},
                        bird_species: {word: "owl", time: 5400}
                    },
                    high_score: 100,
                    total_score: 200,
                    wins: 2,
                    longest_word: "Anthony Albanese"
                });
            });
        });

        describe("Testing postUser function", () => {
            it('should return an error if the username is already in use', async () => {
                await postUser({
                    username:'TestUser',
                    password:'TestPass'}, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith({ message: "User already exists" }, null);
            });
            it('should return successfully if user is new', async () => {
                await postUser({
                    username:'NewUser',
                    password:'NewPass'}, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(null, { acknowledged: true });
            });
        });

        describe("Testing addRefreshToken function", () => {
            it('should be successful if details are good', async () => {
                let result = await addRefreshToken('TestUser', "token");

                expect(result).toEqual({ acknowledged: true });
            });
            it('should return an error if user does not exist', async () => {
                let result = await addRefreshToken('User', "token");

                expect(result).toEqual({message: "Error refreshing token"});
            });
        });

        describe("Testing findRefreshToken function", () => {
            it('should return the user if found', async () => {
                await findRefreshToken('Token', mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(null,                 {
                    username:'TestUser',
                    password:'TestPass',
                    token:'Token',
                    answers: {
                        domesticated_animals: {word:"dog",time:4000}, 
                        dog_breeds: {word: "beagle", time: 4000},
                        autralian_prime_ministers: {word: "Anthony Albanese", time: 3900},
                        bird_species: {word: "owl", time: 5400}
                    },
                    high_score: 100,
                    total_score: 200,
                    wins: 2,
                    longest_word: "Anthony Albanese"
                });
            });
            it('should return an error if user is not found', async () => {
                await findRefreshToken('NewToken', mockCallback);

                expect(mockCallback).toHaveBeenCalledWith({ message: "User not found" }, null);
            });
        });

        describe("Testing updateUserAnswer function", () => {
            it('should return without an error if everything is good', async () => {
                await updateUserAnswer('TestUser', 'domesticated_animals', {word:"cows",time:4000}, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(null);
            });
            it('should return with an error if answer is not an object with a word property', async () => {
                await updateUserAnswer('TestUser', 'domesticated_animals', "cows", mockCallback);

                expect(mockCallback).toHaveBeenCalledWith({message: "Error updating user"});
            });
            it('should return with an error if user does not exist', async () => {
                await updateUserAnswer('User', 'domesticated_animals', {word:"cows",time:4000}, mockCallback);

                expect(mockCallback).toHaveBeenCalledWith({message: "User does not exist"});
            });
        });

        describe("Testing postUserGame function", () => {
            it('should return without an error if everything is good', async () => {
                await postUserGame(true, 11, 'TestUser', mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(null);
            });
            it('should return with an error if user does not exist', async () => {
                await postUserGame(true, 11, 'User', mockCallback);

                expect(mockCallback).toHaveBeenCalledWith({message: "User does not exist"});
            });
        });

        describe("Testing updateUserPassword function", () => {
            it('should return without an error if everything is good', async () => {
                await updateUserPassword('TestUser', 'NewPass', mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(null);
            });
            it('should return with an error if user does not exist', async () => {
                await updateUserPassword('User', 'NewPass', mockCallback);

                expect(mockCallback).toHaveBeenCalledWith({message: "User does not exist"});
            });
        });

        describe("Testing updateUserPassword function", () => {
            it('should return successfully if the user is deleted', async () => {
                await deleteUser('TestUser', mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(null);
            });
            it('should still return successfully even if the user is already deleted', async () => {
                await deleteUser('DeletedUser', mockCallback);

                expect(mockCallback).toHaveBeenCalledWith(null);
            });
        });
    });
}