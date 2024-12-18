let controller = require('../controllers/wordsController');
let express = require('express');
let routes = express.Router();

routes.get('/:category', (req, res) => {
    controller.getWords(req, res);
});

routes.post('/:category', (req, res) => {
    controller.postWord(req, res);
});

module.exports = routes;