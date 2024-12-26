const Player = require('./Player');
const PlayerScore = require('./PlayerScore');

class GameSession {
    constructor(aiPlayers, humanPlayer, antePlayer) {
        if (!Array.isArray(aiPlayers) || aiPlayers.length !== 3) {
            throw new Error('Must provide exactly 3 AI players');
        }
        if (!(humanPlayer instanceof Player)) {
            throw new Error('Human player must be a Player instance');
        }
        if (!(antePlayer instanceof Player)) {
            throw new Error('Ante player must be a Player instance');
        }

        this.currentRound = 1;
        this.categories = ['animals', 'periodic elements', 'countries', 'best picture winning movies'];
        this.currentCategory = this.getRandomCategory();
        this.ai_players = aiPlayers;
        this.human_player = humanPlayer;
        this.ante_player = antePlayer;
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
        if (this.currentRound >= 10) {
            throw new Error('Game has ended');
        }
        this.currentRound++;
        this.currentCategory = this.getRandomCategory();

        const anteScore = this.calculateAnteScore();
        this.ante_player.addScore(new PlayerScore(
            this.currentCategory,
            'A'.repeat(anteScore),
            0
        ));
    }

    isGameOver() {
        return this.currentRound > 10;
    }
}

module.exports = GameSession;