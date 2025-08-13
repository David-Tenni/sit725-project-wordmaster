let controller = require('../controllers/userController');
let express = require('express');
let routes = express.Router();
let authenticator = require('../authenticator');

routes.post('/signup', (req, res) => {
    controller.postUser(req, res);
});

routes.post('/login', (req, res) => {
    controller.login(req, res);
});

routes.post('/refresh', (req, res) => {
    controller.refresh(req, res);
});

routes.get('/', authenticator.protect, (req, res) => {
    controller.getUser(req, res);
});

routes.patch('/answer', authenticator.protect, (req, res) => {
    controller.updateUserAnswer(req, res);
});

routes.patch('/password', authenticator.protect, (req, res) => {
    controller.updateUserPassword(req, res);
});

routes.delete('/', authenticator.protect, (req, res) => {
    controller.deleteUser(req, res);
});

routes.post('/game', authenticator.protect, (req, res) => {
    controller.postUserGame(req, res);
})

routes.get('/:username', (req, res) => {
    controller.getUserByUsername(req, res);
})

module.exports = routes;