let controller = require('../controllers/gameDataController');
let express = require('express');
let routes = express.Router();
let authenticator = require('../authenticator');

routes.get('/categories/:number/:game', (req, res) => {
    controller.getRandomCategories(req, res);
});

routes.get('/categories/:number', (req, res) => {
    controller.getRandomCategories(req, res);
});

routes.post('/players/:number', authenticator.check, (req, res) => {
    controller.getRandomUsers(req, res);
});

module.exports = routes;