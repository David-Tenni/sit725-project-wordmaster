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

        describe('PATCH api/word/count', () => {
            it('should be successful and return 201 if category and word are both given', async () => {
                const payload = {category: 'domesticated_animals', word: 'pig' };
                const response = await request(server).patch('/api/word/count').send(payload);
                expect(response.status).toBe(201);
                expect(response.body.message).toBe('Word count updated');
            });
            it('should respond with an 400 error if the category or word are not given', async () => {
                const payload = {category: 'domesticated_animals' };
                const response = await request(server).patch('/api/word/count').send(payload);
                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Answer must contain category and word');
            });
        });
    });
}