const request = require('supertest');

module.exports = (server) => {
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
                expect(response.body.data.length).toBe(2); //since only two history categories
            });
        });

        describe('GET api/game/players/:number', () => {
            it('should return with a 400 error if categories are not given', async () => {
                const response = await request(server).post('/api/game/players/2');
                expect(response.status).toBe(400);
            });
            it('should respond with a 200 with both users if not logged in', async () => {
                const payload = {categories: ['domesticated_animals']};
                const response = await request(server).post('/api/game/players/2').send(payload);
                expect(response.status).toBe(200);
                expect(Object.keys(response.body.data[0].answers).length).toBe(2);
            });
            it('should respond with a 200 with only one user if only one has the category', async () => {
                const payload = {categories: ['ancient_greek_philosophers']};
                const response = await request(server).post('/api/game/players/1').send(payload);
                expect(response.status).toBe(200);
                expect(Object.keys(response.body.data[0].answers).length).toBe(1);
            });
            it('should respond with a 200 without the current user if logged in', async () => {
                const payload = {categories: ['domesticated_animals']};
                const response = await request(server).post('/api/game/players/1').send(payload).set('Authorization', 'Token');
                expect(response.status).toBe(200);
                expect(Object.keys(response.body.data[0].answers).length).toBe(1);
                expect(response.body.data[0].answers).toHaveProperty('Username');
            });
        });
    });
}