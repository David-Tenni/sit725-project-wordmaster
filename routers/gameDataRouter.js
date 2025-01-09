let controller = require('../controllers/gameDataController');
let express = require('express');
let routes = express.Router();

routes.get('/categories/:number', (req, res) => {
    controller.getRandomCategories(req, res);
});

routes.get('/players/:number', (req, res) => {
    controller.getRandomUsers(req, res);
});

module.exports = routes;