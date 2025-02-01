require('./dbMock');

const server = require('../server');

module.exports = () => {
    require('./wordRoutesTests')(server);
    require('./userRoutesTests')(server);
    require('./gameDataRoutesTests')(server);
    describe("Testing Sockets", () => {
        require('./highScoreTests')();
        require('./totalScoreTests')();
        require('./categoriesTests')();
        require('./wordLengthTests')();
        require('./winsTests')();
    });
}