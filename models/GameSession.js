(function(window) {
    class GameSession {
        constructor(aiPlayers, humanPlayer, antePlayer, totalRounds = 10) {
            if (!Array.isArray(aiPlayers) || aiPlayers.length !== 3) {
                throw new Error('Must provide exactly 3 AI players');
            }
            if (!(humanPlayer instanceof window.Player)) {
                throw new Error('Human player must be a Player instance');
            }
            if (!(antePlayer instanceof window.Player)) {
                throw new Error('Ante player must be a Player instance');
            }
            this.totalRounds = totalRounds;
            this.currentRound = 1;
            this.categories = ['animals', 'periodic elements', 'countries', 'best picture winning movies'];
            this.currentCategory = this.getRandomCategory();
            this.ai_players = aiPlayers;
            this.human_player = humanPlayer;
            this.ante_player = antePlayer;
            this.gameOver = false;

            console.log(`Game initialized with ${this.totalRounds} rounds`);
        }
 
        getRandomCategory() {
            return this.categories[Math.floor(Math.random() * this.categories.length)];
        }
 
        calculateAnteScore() {
            const currentRoundIndex = this.currentRound - 1;
            let totalScore = 0;
            let playerCount = 0;
 
            this.ai_players.forEach(player => {
                if (player.scores[currentRoundIndex]) {
                    totalScore += player.scores[currentRoundIndex].answer.length;
                    playerCount++;
                }
            });
 
            if (this.human_player.scores[currentRoundIndex]) {
                totalScore += this.human_player.scores[currentRoundIndex].answer.length;
                playerCount++;
            }
 
            return playerCount > 0 ? Math.floor(totalScore / playerCount) : 0;
        }
 
        advanceRound() {
            // Check if current round is the last round
            if (this.currentRound >= this.totalRounds) {
                this.gameOver = true;
                return false;
            }
            
            this.currentRound++;
            this.currentCategory = this.getRandomCategory();
            return true;
        }
 
        isGameOver() {
            return this.currentRound >= this.totalRounds || this.gameOver;
        }

        getRemainingRounds() {
            return this.totalRounds - this.currentRound + 1;
        }
    }
 
    window.GameSession = GameSession;
})(window);