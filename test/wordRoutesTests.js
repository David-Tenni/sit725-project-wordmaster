const request = require('supertest');

module.exports = (server) => {
    describe('Testing Word Routes', () => {
        afterEach(() => {
            server.close();
        });

        describe('GET api/word', () => {
            it('should return a list of all words in that category if it exists', async () => {
                const response = await request(server).get('/api/word?categories=domesticated_animals');
                expect(response.status).toBe(200);
                expect(response.body.data.domesticated_animals.length).toEqual(4);
                expect(response.body.message).toBe('Word lists successfully retrieved');
            });
            it('should respond with an 404 error if the category does not exist', async () => {
                const response = await request(server).get('/api/word?categories=animals');
                expect(response.status).toBe(404);
                expect(response.body.message).toBe('Category not found');
            });
        });

        describe('GET api/word/categories', () => {
            it('should return a list of all categories', async () => {
                const response = await request(server).get('/api/word/categories');
                expect(response.status).toBe(200);
                expect(response.body.data.length).toEqual(5);
                expect(response.body.message).toBe('Category list successfully retrieved');
            });
        });
    });
}