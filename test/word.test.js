const request = require('supertest');
const server = require('../server');

jest.mock('../models/connection', () => ({
    db: jest.fn((name) => {
        if(name == 'authentication'){
            const users = [{username:'TestUser',password:'TestPass',token:'Token'}, {username:'Username',password:'Password',token:'Token'}]
            return {
                collection: jest.fn().mockReturnValue({
                    find: jest.fn().mockReturnValue({ 
                        toArray: jest.fn(() => users) 
                    }),
                    findOne: jest.fn((filter) => users.find((user) => filter.hasOwnProperty('username') ? user.username === filter.username : user.token === filter.token) ?? null),
                    insertOne: jest.fn(() => { acknowledged: true }),
                    updateOne: jest.fn(() => { acknowledged: true }),
                    deleteOne: jest.fn(() => { acknowledged: true }),
                })
            }
        }
        else{
            return {
                collection: jest.fn().mockReturnValue({
                    find: jest.fn().mockReturnValue({ 
                        toArray: jest.fn(() => [{word:'Cat'}, {word:'Dog'}, {word:'Cow'}, {word:'Horse'}]) 
                    }),
                }),
                listCollections: jest.fn().mockReturnValue({
                    toArray: jest.fn(() => [{ name: 'domesticated_animals' }]),
                })
            }
            
        }
    })
}));

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn((token, secret, callback) => {
        if (token === 'Token') {
            callback(null, { username: "TestUser" });
        }
        else if (token === 'OldToken') {
            callback(null, { username: "DeletedUser" });
        }
        else {
            callback(new Error('Token is invalid'), null);
        }
    }),
    sign: jest.fn((data, secret, expiresIn) => {
        return "Token";
    }),
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn((data, saltOrRounds) => {
        return data;
    }),
    compare: jest.fn((data, encrypted) => {
        return data == encrypted;
    }),
}));

describe('Testing Word Routes', () => {
    afterEach(() => {
        server.close();
    });

    describe('GET api/word/:category', () => {
        it('should return a list of all words in that category if it exists', async () => {
            const response = await request(server).get('/api/word/domesticated_animals');
            expect(response.status).toBe(200);
            expect(response.body.data.length).toEqual(4);
            expect(response.body.message).toBe('Word list successfully retrieved');
        });
        it('should respond with an 404 error if the category does not exist', async () => {
            const response = await request(server).get('/api/word/animals');
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Category not found');
        });
    });

    describe('GET api/word/categories', () => {
        it('should return a list of all categories', async () => {
            const response = await request(server).get('/api/word/categories');
            expect(response.status).toBe(200);
            expect(response.body.data.length).toEqual(1);
            expect(response.body.message).toBe('Category list successfully retrieved');
        });
    });
});