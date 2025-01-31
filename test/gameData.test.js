require('./mocks');

const request = require('supertest');
const server = require('../server');

describe('Testing Game Data Routes', () => {
    afterEach(() => {
        server.close();
    });

    describe('GET api/game/categories/:number', () => {
        it('should respond with a 404 error if no number is given', async () => {
            const response = await request(server).get('/api/game/categories');
            expect(response.status).toBe(404);
        });
        it('should respond with a 400 error if number is not a number is given', async () => {
            const response = await request(server).get('/api/game/categories/num');
            expect(response.status).toBe(400);
        });
        it('should respond with a 200 if categories are successfully retrieved', async () => {
            const response = await request(server).get('/api/game/categories/3');
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(3);
        });
    });

    describe('GET api/game/categories/:number/:game', () => {
        it('should respond with a 400 error if number is not a number is given', async () => {
            const response = await request(server).get('/api/game/categories/num/History');
            expect(response.status).toBe(400);
        });
        it('should respond with a 200 if categories are successfully retrieved', async () => {
            const response = await request(server).get('/api/game/categories/3/History');
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(2); // only responds with 2 since there is only 2 history categories
        });
    });
});