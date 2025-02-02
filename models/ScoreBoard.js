(function (window) {
  class ScoreBoard {
    constructor() {
      // Start with just player and ante
      this.players = {
        player: { totalScore: 0, scores: [], eliminated: false },
        ante: { totalScore: 0, scores: [], eliminated: false },
      };

      this.currentRound = 1;
      this.currentCategory = "";
      this.aiResponded = new Set();
      this.roundComplete = false;

      // console.log("Initialized basic ScoreBoard");
    }

    initializeAIPlayers(gameData) {
      if (!gameData?.rounds?.[0]?.answers) {
        console.error("Invalid game data for AI initialization");
        return;
      }

      // Get AI player names from first round
      const aiPlayerNames = Object.keys(gameData.rounds[0].answers);
      // console.log("Initializing AI players:", aiPlayerNames);

      // Add each AI player to the players object
      aiPlayerNames.forEach((name) => {
        this.players[name] = {
          totalScore: 0,
          scores: [],
          eliminated: false,
          responseTime: 0,
        };
      });
    }

    getCurrentRound() {
      return this.currentRound;
    }

    getNumberOfRounds() {
      return this.currentRound;
    }

    getCurrentCategory() {
      return this.currentCategory;
    }

    getPlayerScore(playerName) {
      return this.players[playerName]?.totalScore || 0;
    }

    findPlayer(playerName) {
      return this.players[playerName];
    }

    hasPlayerResponded() {
      return this.players.player.scores.length === this.currentRound;
    }

    isRoundComplete() {
      return this.roundComplete;
    }

    allAIRespondedThisRound() {
      const aiPlayers = Object.keys(this.players).filter(
        (name) => name !== "player" && name !== "ante"
      );
      return aiPlayers.every((name) => this.aiResponded.has(name));
    }

    recordAIResponse(playerName, answer, time, score) {
      const player = this.players[playerName];
      if (player && !this.aiResponded.has(playerName)) {
        // default to 0 if not provided
        const finalScore = Number(score) || answer.length / 3; // Fallback to answer length  divied by 3

        player.scores.push({
          round: this.currentRound,
          score: finalScore,
          answer: answer,
          time: time,
        });

        player.totalScore += finalScore;
        this.aiResponded.add(playerName);

        // console.log(`Recorded response for ${playerName}:`, {
        //     answer,
        //     score: finalScore,
        //     totalScore: player.totalScore
        // });

        if (this.allAIRespondedThisRound()) {
          this.roundComplete = true;
        }

        this.updateAnteScore();
      }
    }

    recordAnswer(playerName, answer, time) {
      const player = this.players[playerName];
      if (player && !this.hasPlayerResponded()) {
        const score = answer.length;
        player.scores.push({
          round: this.currentRound,
          score: score,
          answer: answer,
          time: time,
        });
        player.totalScore += score;
      }
    }

    prepareAIResponses() {
      const aiPlayers = Object.keys(this.players).filter(
        (name) => name !== "player" && name !== "ante"
      );
      this.aiResponded.clear();
      this.roundComplete = false;

      aiPlayers.forEach((name) => {
        const player = this.players[name];
        player.responseTime = 0; // Reset response time
      });
    }

    updateAnteScore() {
      const aiPlayers = Object.keys(this.players).filter(
        (name) => name !== "player" && name !== "ante"
      );

      const respondedPlayers = aiPlayers.filter((name) =>
        this.aiResponded.has(name)
      );

      if (respondedPlayers.length > 0) {
        const totalScore = respondedPlayers.reduce((sum, name) => {
          const latestScore =
            this.players[name].scores[this.players[name].scores.length - 1]
              .score;
          return sum + latestScore;
        }, 0);

        const avgScore = Math.floor(totalScore / respondedPlayers.length);
        const ante = this.players["ante"];

        // Clear previous ANTE scores for this round
        ante.scores = ante.scores.filter(
          (score) => score.round !== this.currentRound
        );

        // Add new ANTE score
        ante.scores.push({
          round: this.currentRound,
          score: avgScore,
          answer: "A".repeat(avgScore),
          time: 0,
        });

        ante.totalScore = ante.scores.reduce(
          (sum, round) => sum + round.score,
          0
        );
      }
    }

    advanceRound() {
      if (this.currentRound < 10) {
        this.currentRound++;
        this.aiResponded.clear();
        this.roundComplete = false;
        return true;
      }
      return false;
    }

    getLatestAnswer(playerName) {
      const player = this.players[playerName];
      if (player?.scores.length > 0) {
        return player.scores[player.scores.length - 1].answer;
      }
      return "";
    }

    isGameOver() {
      return this.currentRound === 10 && this.roundComplete;
    }

    createBarContainers() {
      return Object.keys(this.players)
        .map(
          (playerName) => `
          <div class="bar-container">
            <div class="bar" id="${playerName}" data-value="0">
              <div class="bar-value">
                <div class="current-word"></div>
                <div class="total-score">Total: 0</div>
              </div>
            </div>
            <div class="player-name">${
              playerName.charAt(0).toUpperCase() + playerName.slice(1)
            }</div>
          </div>
        `
        )
        .join("");
    }
  }

  window.ScoreBoard = ScoreBoard;
})(window);
