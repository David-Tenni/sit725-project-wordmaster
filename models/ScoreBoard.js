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
      // Use categories from test data to match the predefined answers
      this.currentCategory = window.gameTestData.rounds[0].category;
      this.aiResponded = new Set(); // Track which AI players have responded this round
      this.roundComplete = false;
      
      console.log('Initialized ScoreBoard with test data');
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

    // Prepare AI response times from test data
    prepareAIResponses() {
      const aiPlayers = ['james', 'sofia', 'lucas'];
      this.aiResponded.clear();
      this.roundComplete = false;
      
      // Get test data for current round
      const roundData = window.gameTestData.rounds[this.currentRound - 1];
      
      aiPlayers.forEach(name => {
        const player = this.players[name];
        // Use predefined response time from test data
        player.responseTime = roundData.answers[name].time;
        console.log(`${name} will respond in ${player.responseTime}ms with "${roundData.answers[name].word}"`);
      });
    }

    // Check if an AI player should respond at the current time
    checkAIResponses(elapsedTime) {
      if (this.roundComplete) return;

      const aiPlayers = ['james', 'sofia', 'lucas'];
      const roundData = window.gameTestData.rounds[this.currentRound - 1];
      
      aiPlayers.forEach(name => {
        const player = this.players[name];
        if (!this.aiResponded.has(name) && elapsedTime >= player.responseTime) {
          // Use predefined word from test data
          const testAnswer = roundData.answers[name];
          this.recordAIResponse(name, testAnswer.word, testAnswer.time);
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
        // Get next category from test data
        this.currentCategory = window.gameTestData.rounds[this.currentRound - 1].category;
        this.aiResponded.clear();
        this.roundComplete = false;
      } else if (this.currentRound === 10) {
        // Mark the game as complete without advancing the round
        this.roundComplete = true;
        this.gameOver = true;
      }
    }

    getLatestAnswer(playerName) {
      const player = this.players[playerName.toLowerCase()];
      if (player && player.scores.length > 0) {
        return player.scores[player.scores.length - 1].answer;
      }
      return '';
    }

    isGameOver() {
      return this.currentRound === 10 && this.roundComplete;
    }
  }

  // Add to window object
  window.ScoreBoard = ScoreBoard;
})(window);