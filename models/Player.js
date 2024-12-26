const PlayerScore = require('./PlayerScore');

class Player {
    constructor(playerId, playerName) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.scores = [];  // Array of PlayerScore objects, max length 10
    }

    addScore(score) {
        if (!(score instanceof PlayerScore)) {
            throw new Error('Score must be a PlayerScore instance');
        }
        if (this.scores.length >= 10) {
            throw new Error('Maximum rounds (10) reached');
        }
        this.scores.push(score);
    }

    getLatestScore() {
        return this.scores[this.scores.length - 1];
    }
}

module.exports = Player;