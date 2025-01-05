let controller = require('../controllers/wordsController');
let express = require('express');
let routes = express.Router();

routes.get('/categories', (req, res) => {
    controller.getCategories(req, res);
});

routes.get('/:category', (req, res) => {
    controller.getWords(req, res);
});

module.exports = routes;