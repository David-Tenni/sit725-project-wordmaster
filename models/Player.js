(function(window) {
    class Player {
        constructor(playerId, playerName) {
            this.playerId = playerId;
            this.playerName = playerName;
            this.scores = [];
        }
    
        addScore(score) {
            if (!(score instanceof window.PlayerScore)) {
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
    
    window.Player = Player;
    })(window);