(function(window) {
  class ScoreBoard {
    constructor() {
      // Initialize players with score history
      this.players = {
        player: { totalScore: 0, scores: [], eliminated: false },
        james: { totalScore: 0, scores: [], eliminated: false, responseTime: 0 },
        sofia: { totalScore: 0, scores: [], eliminated: false, responseTime: 0 },
        lucas: { totalScore: 0, scores: [], eliminated: false, responseTime: 0 },
        ante: { totalScore: 0, scores: [], eliminated: false }
      };
      
      this.currentRound = 1;
      this.categories = ['animals', 'periodic elements', 'countries', 'best picture winning movies'];
      this.currentCategory = this.getRandomCategory();
      this.aiResponded = new Set(); // Track which AI players have responded this round
      this.roundComplete = false;
      
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
      return this.players[playerName.toLowerCase()]?.totalScore || 0;
    }

    findPlayer(playerName) {
      return this.players[playerName.toLowerCase()];
    }

    hasPlayerResponded() {
      return this.players.player.scores.length === this.currentRound;
    }

    isRoundComplete() {
      return this.roundComplete;
    }

    allAIRespondedThisRound() {
      const aiPlayers = ['james', 'sofia', 'lucas'];
      return aiPlayers.every(name => this.aiResponded.has(name));
    }

    // Record an individual AI response
    recordAIResponse(playerName, answer, time) {
      const player = this.players[playerName.toLowerCase()];
      if (player && !this.aiResponded.has(playerName)) {
        const score = answer.length;
        player.scores.push({ 
          round: this.currentRound, 
          score: score, 
          answer: answer,
          time: time 
        });
        player.totalScore += score;
        this.aiResponded.add(playerName);
        
        // After each AI response, check if all have responded
        if (this.allAIRespondedThisRound()) {
          this.roundComplete = true;
        }
        
        // Update ANTE score
        this.updateAnteScore();
      }
    }

    // Updated to handle player submission
    recordAnswer(playerName, answer, time) {
      const player = this.players[playerName.toLowerCase()];
      if (player && !this.hasPlayerResponded()) {
        const score = answer.length;
        player.scores.push({ 
          round: this.currentRound, 
          score: score, 
          answer: answer,
          time: time 
        });
        player.totalScore += score;

        // If this was the player's submission, prepare AI responses
        if (playerName.toLowerCase() === 'player') {
          this.prepareAIResponses();
        }
      }
    }

    // Prepare AI response times for this round
    prepareAIResponses() {
      const aiPlayers = ['james', 'sofia', 'lucas'];
      this.aiResponded.clear(); // Reset for new round
      this.roundComplete = false;
      
      aiPlayers.forEach(name => {
        const player = this.players[name];
        // Random response time between 1 and 7 seconds
        player.responseTime = Math.floor(Math.random() * 6000) + 1000;
        console.log(`${name} will respond in ${player.responseTime}ms`);
      });
    }

    // Check if an AI player should respond at the current time
    checkAIResponses(elapsedTime) {
      if (this.roundComplete) return;

      const aiPlayers = ['james', 'sofia', 'lucas'];
      
      aiPlayers.forEach(name => {
        const player = this.players[name];
        if (!this.aiResponded.has(name) && elapsedTime >= player.responseTime) {
          // Generate and record AI response
          const words = {
            'animals': ['cat', 'dog', 'elephant', 'giraffe', 'penguin', 'lion', 'zebra', 'kangaroo'],
            'countries': ['france', 'spain', 'japan', 'brazil', 'italy', 'germany', 'canada', 'australia'],
            'periodic elements': ['hydrogen', 'helium', 'lithium', 'carbon', 'nitrogen', 'oxygen', 'sodium', 'iron'],
            'best picture winning movies': ['titanic', 'parasite', 'coda', 'spotlight', 'argo', 'gladiator', 'chicago', 'nomadland']
          };
          
          const category = this.currentCategory;
          const possibleWords = words[category] || words['animals'];
          const word = possibleWords[Math.floor(Math.random() * possibleWords.length)];
          
          this.recordAIResponse(name, word, player.responseTime);
        }
      });
    }

    updateAnteScore() {
      const aiPlayers = ['james', 'sofia', 'lucas'];
      const respondedPlayers = aiPlayers.filter(name => this.aiResponded.has(name));
      
      if (respondedPlayers.length > 0) {
        const totalScore = respondedPlayers.reduce((sum, name) => {
          const latestScore = this.players[name].scores[this.players[name].scores.length - 1].score;
          return sum + latestScore;
        }, 0);
        
        const avgScore = Math.floor(totalScore / respondedPlayers.length);
        const ante = this.players['ante'];
        
        // Clear previous ANTE scores for this round if they exist
        ante.scores = ante.scores.filter(score => score.round !== this.currentRound);
        
        // Update ANTE's score for this round
        ante.scores.push({ 
          round: this.currentRound, 
          score: avgScore, 
          answer: 'A'.repeat(avgScore),
          time: 0
        });
        
        // Recalculate total score
        ante.totalScore = ante.scores.reduce((sum, round) => sum + round.score, 0);
      }
    }

    advanceRound() {
      if (this.currentRound < 10) {
        this.currentRound++;
        this.currentCategory = this.getRandomCategory();
        this.aiResponded.clear();
        this.roundComplete = false;
      }
    }

    getLatestAnswer(playerName) {
      const player = this.players[playerName.toLowerCase()];
      if (player && player.scores.length > 0) {
        return player.scores[player.scores.length - 1].answer;
      }
      return '';
    }
  }

  // Add to window object
  window.ScoreBoard = ScoreBoard;
})(window);