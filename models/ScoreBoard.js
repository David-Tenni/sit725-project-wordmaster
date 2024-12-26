(function(window) {
  class ScoreBoard {
    constructor() {
      // Initialize players
      this.players = {
        player: { score: 0, eliminated: false },
        james: { score: 0, eliminated: false },
        sofia: { score: 0, eliminated: false },
        lucas: { score: 0, eliminated: false },
        ante: { score: 0, eliminated: false }
      };
      
      this.currentRound = 1;
      this.categories = ['animals', 'periodic elements', 'countries', 'best picture winning movies'];
      this.currentCategory = this.getRandomCategory();
      
      console.log('Initialized ScoreBoard');
    }

    getRandomCategory() {
      return this.categories[Math.floor(Math.random() * this.categories.length)];
    }

    getCurrentRound() {
      return this.currentRound;
    }

    getCurrentCategory() {
      return this.currentCategory;
    }

    getPlayerScore(playerName) {
      return this.players[playerName.toLowerCase()]?.score || 0;
    }

    findPlayer(playerName) {
      return this.players[playerName.toLowerCase()];
    }

    recordAnswer(playerName, answer, time) {
      const player = this.players[playerName.toLowerCase()];
      if (player) {
        player.score = answer.length; // Simple scoring based on word length
        
        // Generate AI responses after player submission
        if (playerName.toLowerCase() === 'player') {
          this.generateAIResponses();
          this.advanceRound();
        }
      }
    }

    generateAIResponses() {
      const aiPlayers = ['james', 'sofia', 'lucas'];
      aiPlayers.forEach(name => {
        const wordLength = Math.floor(Math.random() * 5) + 3; // Random length 3-7
        this.players[name].score = wordLength;
      });

      // Calculate ANTE score
      const scores = aiPlayers.map(name => this.players[name].score);
      const avgScore = Math.floor(scores.reduce((a, b) => a + b, 0) / scores.length);
      this.players['ante'].score = avgScore;
    }

    advanceRound() {
      if (this.currentRound < 10) {
        this.currentRound++;
        this.currentCategory = this.getRandomCategory();
      }
    }
  }

  // Add to window object
  window.ScoreBoard = ScoreBoard;
})(window);