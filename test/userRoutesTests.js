const request = require('supertest');

module.exports = (server) => {
    describe('Testing User Routes', () => {
        afterEach(() => {
            server.close();
        });

        describe('GET api/user', () => {
            it('should respond with a 401 error if the user is unauthenicated', async () => {
                const response = await request(server).get('/api/user').set('Authorization', 'FakeToken');
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('Invalid token');
            });
            it('should respond with a 404 error if the user does not exist', async () => {
                const response = await request(server).get('/api/user').set('Authorization', 'OldToken');
                expect(response.status).toBe(404);
                expect(response.body.message).toBe('User not found');
            });
            it('should respond with an 200 if the user is successfully retrieved', async () => {
                const response = await request(server).get('/api/user').set('Authorization', 'Token');
                expect(response.status).toBe(200);
                expect(response.body.data.username).toBe("TestUser");
                expect(response.body.message).toBe('User successfully retrieved');
            });
        });

        describe('POST api/user/signup', () => {
            it('should respond with a 400 error if the username is missing', async () => {
                const payload = {password: '12345' };
                const response = await request(server).post('/api/user/signup').send(payload);
                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Username or password is missing');
            });
            it('should respond with a 400 error if the password is missing', async () => {
                const payload = {username: 'NewUser' };
                const response = await request(server).post('/api/user/signup').send(payload);
                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Username or password is missing');
            });
            it('should respond with a 409 error if the username is already in use', async () => {
                const payload = {username: 'Username', password: '12345' };
                const response = await request(server).post('/api/user/signup').send(payload);
                expect(response.status).toBe(409);
                expect(response.body.message).toBe('User already exists');
            });
            it('should respond with 201 if the user is successfully registered', async () => {
                const payload = {username: 'NewUser', password: '12345' };
                const response = await request(server).post('/api/user/signup').send(payload);
                expect(response.status).toBe(201);
                expect(response.body.message).toBe('New user registered');
            });
        });

        describe('POST api/user/login', () => {
            it('should respond with a 400 error if the username is missing', async () => {
                const payload = {password: '12345' };
                const response = await request(server).post('/api/user/login').send(payload);
                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Username or password is missing');
            });
            it('should respond with a 400 error if the password is missing', async () => {
                const payload = {username: 'NewUser' };
                const response = await request(server).post('/api/user/login').send(payload);
                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Username or password is missing');
            });
            it('should respond with a 401 error if the username does not exist', async () => {
                const payload = {username: 'NonExistingUser', password: '12345' };
                const response = await request(server).post('/api/user/login').send(payload);
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('Password or Username are incorrect');
            });
            it('should respond with a 401 error if the password is incorrect', async () => {
                const payload = {username: 'Username', password: 'FalsePassword' };
                const response = await request(server).post('/api/user/login').send(payload);
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('Password or Username are incorrect');
            });
            it('should respond with 200 if all credentials are correct', async () => {
                const payload = {username: 'Username', password: 'Password' };
                const response = await request(server).post('/api/user/login').send(payload);
                expect(response.status).toBe(200);
                expect(response.body.accessToken).toBe('Token');
                expect(response.body.refreshToken).toBe('Token');
                expect(response.body.message).toBe('Successfully logged in');
            });
        });

        describe('POST api/user/refresh', () => {
            it('should respond with a 401 error if the token is missing', async () => {
                const payload = {};
                const response = await request(server).post('/api/user/refresh').send(payload);
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('Invalid token');
            });
            it('should respond with a 401 error if the user does not exist', async () => {
                const payload = {token: 'OldToken' };
                const response = await request(server).post('/api/user/refresh').send(payload);
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('Invalid token');
            });
            it('should respond with a 401 error if the token is invalid', async () => {
                const payload = { token: 'FalseToken' };
                const response = await request(server).post('/api/user/refresh').send(payload);
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('Invalid token');
            });
            it('should respond with 200 with a new access token if the token was correct', async () => {
                const payload = { token: 'Token' };
                const response = await request(server).post('/api/user/refresh').send(payload);
                expect(response.status).toBe(200);
                expect(response.body.accessToken).toBe('Token');
                expect(response.body.message).toBe('Token successfully refreshed');
            });
        });
        
        describe('PATCH api/user/answer', () => {
            it('should respond with a 401 error if the user is unauthenicated', async () => {
                const response = await request(server).patch('/api/user/answer').set('Authorization', 'FakeToken');
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('Invalid token');
            });
            it('should respond with a 400 error if category, time and word are not all present', async () => {
                const payload = {};
                const response = await request(server).patch('/api/user/answer').send(payload).set('Authorization', 'Token');
                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Answer must contain category, word and time');
            });
            it('should respond with a 404 error if the category is not real', async () => {
                const payload = {category: "animals", time: 3000, word: "Cat"};
                const response = await request(server).patch('/api/user/answer').send(payload).set('Authorization', 'Token');
                expect(response.status).toBe(404);
                expect(response.body.message).toBe('Category not found');
            });
            it('should respond with a 404 error if the user does not exist', async () => {
                const payload = {category: "domesticated_animals", time: 3000, word: "Cat"};
                const response = await request(server).patch('/api/user/answer').send(payload).set('Authorization', 'OldToken');
                expect(response.status).toBe(404);
                expect(response.body.message).toBe('User does not exist');
            });
            it('should respond with 201 if answer has been successfully updated', async () => {
                const payload = {category: "domesticated_animals", time: 3000, word: "Cat"};
                const response = await request(server).patch('/api/user/answer').send(payload).set('Authorization', 'Token');
                expect(response.status).toBe(201);
                expect(response.body.message).toBe('Word updated');
            });
        });

        describe('PATCH api/user/password', () => {
            it('should respond with a 401 error if the user is unauthenicated', async () => {
                const response = await request(server).patch('/api/user/password').set('Authorization', 'FakeToken');
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('Invalid token');
            });
            it('should respond with a 400 error if password is not present', async () => {
                const payload = {};
                const response = await request(server).patch('/api/user/password').send(payload).set('Authorization', 'Token');
                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Password does not exist');
            });
            it('should respond with a 404 error if the user does not exist', async () => {
                const payload = {password:"12345"};
                const response = await request(server).patch('/api/user/password').send(payload).set('Authorization', 'OldToken');
                expect(response.status).toBe(404);
                expect(response.body.message).toBe('User does not exist');
            });
            it('should respond with 201 if password has been successfully updated', async () => {
                const payload = {password:"12345"};
                const response = await request(server).patch('/api/user/password').send(payload).set('Authorization', 'Token');
                expect(response.status).toBe(201);
                expect(response.body.message).toBe('Password updated');
            });
        });

        describe('DELETE api/user', () => {
            it('should respond with a 401 error if the user is unauthenicated', async () => {
                const response = await request(server).delete('/api/user').set('Authorization', 'FakeToken');
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('Invalid token');
            });
            it('hould respond with 204 if user does not exist', async () => {
                const response = await request(server).delete('/api/user').set('Authorization', 'OldToken');
                expect(response.status).toBe(204);
            });
            it('should respond with 204 if user has been successfully deleted', async () => {
                const response = await request(server).delete('/api/user').set('Authorization', 'Token');
                expect(response.status).toBe(204);
            });
        });

        describe('POST api/user/game', () => {
            it('should respond with a 401 error if the user is unauthenicated', async () => {
                const response = await request(server).post('/api/user/game').set('Authorization', 'FakeToken');
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('Invalid token');
            });
            it('should respond with a 400 error if no win or score is given', async () => {
                const response = await request(server).post('/api/user/game').set('Authorization', 'Token');
                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Request must contain win and score');
            });
            it('should respond with a 400 error if score is not a number', async () => {
                const payload = {win: true, score: "not a number"};
                const response = await request(server).post('/api/user/game').send(payload).set('Authorization', 'Token');
                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Score must be a number');
            });
            it('should respond with a 400 error if win is not a boolean', async () => {
                const payload = {win: "not a bool", score: 12};
                const response = await request(server).post('/api/user/game').send(payload).set('Authorization', 'Token');
                expect(response.status).toBe(400);
                expect(response.body.message).toBe('Win must be true or false');
            });
            it('should respond with a 400 error if win is not a boolean', async () => {
                const payload = {win: true, score: 12};
                const response = await request(server).post('/api/user/game').send(payload).set('Authorization', 'OldToken');
                expect(response.status).toBe(404);
                expect(response.body.message).toBe('User does not exist');
            });
            it('should respond with 201 if it is successful', async () => {
                const payload = {win: true, score: 12};
                const response = await request(server).post('/api/user/game').send(payload).set('Authorization', 'Token');
                expect(response.status).toBe(201);
                expect(response.body.message).toBe('Game data added to user');
            });
        });
        
        describe('POST api/user/game', () => {
            it('should respond with a 400 error if win is not a boolean', async () => {
                const response = await request(server).get('/api/user/DeletedUser');
                expect(response.status).toBe(404);
                expect(response.body.message).toBe('User not found');
            });
            it('should respond with 200 if it is successfully found', async () => {
                const response = await request(server).get('/api/user/TestUser');
                expect(response.status).toBe(200);
                expect(response.body.data.username).toBe("TestUser");
                expect(response.body.message).toBe('User successfully retrieved');
            });
        });
    });
}