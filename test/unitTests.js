module.exports = () => {
    describe("Testing Models", () => {
        require('./gameDataTests')();
        //GameSession - FE
        //Player - FE
        //PlayerScore - FE
        //ScoreBoard - FE
        require('./userTests')();
        require('./wordTests')();
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
}