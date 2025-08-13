let controller = require('../controllers/wordsController');
let express = require('express');
let routes = express.Router();

routes.get('/categories', (req, res) => {
    controller.getCategories(req, res);
});

routes.get('/', (req, res) => {
    controller.getWords(req, res);
});

routes.patch('/count', (req, res) => {
    controller.addCount(req, res);
})

module.exports = routes;