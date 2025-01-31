require('./dbMock');

const server = require('../server');

module.exports = () => {
    require('./wordRoutesTests')(server);
    require('./userRoutesTests')(server);
    require('./gameDataRoutesTests')(server);
}