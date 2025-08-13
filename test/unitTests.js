module.exports = () => {
    describe("Testing Models", () => {
        require('./gameDataTests')();
        require('./userTests')();
        require('./wordTests')();
        require('./categorySelectionControllerTests')();
    });
    describe("Testing Controllers", () => {
        //categorySelectionController - BE
        //categoryController - FE
        //gameController - FE
        //gamedatacontroller - BE
        //leaderboaradcontroller - FE
        //notificationcontroller - FE
        //profilecontroller - FE
        //scoreboardcontroller - FE
        //usercontroller - BE
        //wordscontroller - BE
    });
};