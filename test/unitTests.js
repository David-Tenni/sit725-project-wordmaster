module.exports = () => {
    describe("Testing Models", () => {
        require('./gameDataTests')();
        //GameSession - FE
        //Player - FE
        //PlayerScore - FE
        //ScoreBoard - FE
        //user - BE
        //word - BE
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