(function (window) {
  class GameController {
    //added a parameter selected category
    constructor(totalRounds = 5, selectedCategory = null) {
      console.log("GameController initializing...");
      this.timeLimit = 7000;
      this.startTime = null;
      this.timerInterval = null;
      this.initialCategoryDisplayed = false;
      this.totalRounds = totalRounds;
      //added selected category property
      this.selectedCategory = selectedCategory;
      this.gameData = null;
      this.initializeGame();
      this.initializeEventListeners();
    }
    calculateScore(word, count, responseTime) {
      if (!word) return 0;

      let baseScore;
      const wordLength = word.length;

      switch (true) {
        case wordLength <= 3:
          baseScore = 1;
          break;
        case wordLength <= 6:
          baseScore = 2;
          break;
        case wordLength <= 12:
          baseScore = 3;
          break;
        default:
          baseScore = 4;
      }

      let rarityBonus;
      switch (true) {
        case count === 0:
          rarityBonus = 3;
          break;
        case count <= 10:
          rarityBonus = 2;
          break;
        default:
          rarityBonus = 1.2;
      }

      let timeBonus;
      if (responseTime < 2000) {
        timeBonus = 2;
      } else if (responseTime < 3000) {
        timeBonus = 1.5;
      } else if (responseTime < 5000) {
        timeBonus = 1.25;
      } else {
        timeBonus = 1;
      }

      const finalScore = (baseScore + rarityBonus) * timeBonus;

      // Update scoring display only for human player
      const lengthElement = document.getElementById("length-bonus");
      const rarityElement = document.getElementById("rarity-bonus");
      const speedElement = document.getElementById("speed-multi");
      const totalScoreElement = document.getElementById("total-score");

      if (lengthElement)
        lengthElement.textContent = `Length Bonus: +${baseScore}`;
      if (rarityElement)
        rarityElement.textContent = `Rarity Bonus: +${rarityBonus}`;
      if (speedElement) speedElement.textContent = `Speed Multi: ×${timeBonus}`;
      if (totalScoreElement)
        totalScoreElement.textContent = `Total Score: ${Math.round(
          finalScore
        )}`;

      return Math.round(finalScore);
    }
    async checkEndpoint(url) {
      try {
        const response = await fetch(url);
        console.log(`Endpoint check (${url}):`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers),
          ok: response.ok,
        });
      } catch (error) {
        console.error(`Endpoint check failed (${url}):`, error);
      }
    }

    async fetchGameData() {
      try {
        console.log("Starting data fetch...");
        //updated the api call for the selected category and kept a default number 7 for sub categories
        let categoriesResponse;
        if (this.selectedCategory) {
          categoriesResponse = await fetch(
            `/api/game/categories/7/${this.selectedCategory}`,
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          );
        } else {
          //random category
          categoriesResponse = await fetch("/api/game/categories/7", {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });
        }

        const categoriesData = await categoriesResponse.json();
        console.log("Categories data:", categoriesData);
        const playersUrl = "/api/game/players/3";
        const playersResponse = await fetch(playersUrl, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("accessToken"),
          },
          body: JSON.stringify({
            categories: categoriesData.data,
          }),
        });

        if (!playersResponse.ok) {
          throw new Error(`Players request failed: ${playersResponse.status}`);
        }

        const playersData = await playersResponse.json();
        this.gameData = {
          rounds: playersData.data,
        };

        return true;
      } catch (error) {
        console.error("Fetch error:", error);
        if (window.M && window.M.toast) {
          window.M.toast({
            html: `Failed to load game data: ${error.message}`,
            classes: "red",
          });
        }
        return false;
      }
    }
    async fetchAndStoreValidWords(categories) {
      console.log("Starting to fetch valid words for categories:", categories);
      try {
        for (const category of categories) {
          console.log(`Fetching words for category: ${category}`);
          const response = await fetch(`/api/word/${category}`);

          const data = await response.json();
          console.log(`Raw API response for ${category}:`, data);

          if (data.data) {
            // Extract just the word values from the objects
            const wordList = data.data.map((item) => item.word);

            localStorage.setItem(
              `validWords_${category}`,
              JSON.stringify(wordList)
            );
          }
        }
      } catch (error) {
        console.error("Error fetching valid words:", error);
        M.toast({
          html: "Failed to load word lists. Please refresh the page.",
          classes: "red",
          displayLength: 3000,
        });
      }
    }
    async initializeGame() {
      console.log("Initializing game...");

      const dataFetched = await this.fetchGameData();
      if (!dataFetched) {
        console.error("Failed to initialize game");
        return;
      }

      // Create ScoreBoard and initialize with game data
      this.scoreBoard = new window.ScoreBoard();

      // Get player names from the first round
      const firstRound = this.gameData.rounds[0];
      const allAiPlayerNames = Object.keys(firstRound.answers);

      // Take only the first 3 AI players
      const aiPlayerNames = allAiPlayerNames.slice(0, 3);
      console.log("Selected AI Player Names:", aiPlayerNames);

      // Create AI player instances (only 3)
      const aiPlayers = aiPlayerNames.map(
        (name, index) => new window.Player(index + 1, name)
      );

      // Fetch and store valid words for each category
      const categories = this.gameData.rounds.map((round) => round.category);

      await this.fetchAndStoreValidWords(categories);

      // Filter game data to only include selected players
      this.gameData.rounds = this.gameData.rounds.map((round) => ({
        ...round,
        answers: Object.fromEntries(
          Object.entries(round.answers).filter(([name]) =>
            aiPlayerNames.includes(name)
          )
        ),
        category: round.category,
      }));

      let currentPlayerName = "Player";
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (isLoggedIn) {
        currentPlayerName = localStorage.getItem("user");
      }
      const humanPlayer = new window.Player(4, currentPlayerName);
      const antePlayer = new window.Player(5, "ANTE");

      // Initialize game session with exactly 3 AI players
      this.gameSession = new window.GameSession(
        aiPlayers,
        humanPlayer,
        antePlayer,
        this.totalRounds
      );

      // Initialize ScoreBoard with filtered game data
      this.scoreBoard.initializeAIPlayers(this.gameData);

      if (firstRound) {
        this.gameSession.currentCategory = firstRound.category;
        this.scoreBoard.currentCategory = firstRound.category;
        this.dispatchGameStateUpdate();
      }

      this.startTimer();
    }

    initializeEventListeners() {
      document.addEventListener("wordSubmitted", (e) => {
        this.handleWordSubmission(e.detail.word);
      });
      if (this.scoreBoard) {
        this.scoreBoard.updateScoringDisplay(baseScore, rarityBonus, timeBonus);
      }
      document.addEventListener("timerTick", (e) => {
        this.checkAIResponses(e.detail.elapsed);
      });
    }

    handleWordSubmission(word) {
      if (!word || this.gameSession.isGameOver()) return;

      const { isValid, wordData } = this.isValidWord(
        word,
        this.gameSession.currentCategory
      );
      if (!isValid) {
        M.toast({
          html: "Invalid word for this category!",
          classes: "red",
          displayLength: 2000,
        });
        const input = document.getElementById("playerPoints");
        input.classList.add("invalid");
        setTimeout(() => input.classList.remove("invalid"), 1000);
        return;
      }

      const responseTime = Date.now() - this.startTime;
      const score = this.calculateScore(word, wordData.count, responseTime);

      // If user is logged in, save to database
      if (localStorage.getItem("isLoggedIn") === "true") {
        const accessToken = localStorage.getItem("accessToken");

        if (
          accessToken &&
          accessToken !== "undefined" &&
          accessToken !== "null"
        ) {
          $.ajax({
            url: "/api/user/answer",
            method: "PATCH",
            headers: {
              Authorization: accessToken,
              "Content-Type": "application/json",
            },
            data: JSON.stringify({
              category: this.gameSession.currentCategory,
              word: word,
              time: responseTime,
              score: score,
            }),
            success: function (response) {
              console.log("Answer saved to database:", response);
            },
            error: function (error) {
              console.error("Error saving answer:", error);
            },
          });
        }
      }

      $.ajax({
        url: "/api/word/count",
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          category: this.gameSession.currentCategory,
          word: word,
        }),
        success: function (response) {
          console.log("Word count incremented:", response);
        },
        error: function (error) {
          console.error("Error incrementing word count:", error);
        },
      });

      // Record the score for human player
      const playerScore = new window.PlayerScore(
        this.gameSession.currentCategory,
        word,
        responseTime,
        score
      );
      this.gameSession.human_player.addScore(playerScore);
      this.scoreBoard.recordAnswer("player", word, responseTime, score);

      // Handle AI responses
      this.forceAIResponses();

      // Check game state
      if (this.gameSession.currentRound >= this.totalRounds - 1) {
        this.handleGameOver();
      } else if (this.gameSession.advanceRound()) {
        this.startNewRound();
      }
    }
    forceAIResponses() {
      const currentRound = this.gameSession.currentRound;
      const roundData = this.gameData.rounds[currentRound - 1];
    
      if (!roundData) {
        console.error("No round data found for round:", currentRound);
        return;
      }
    
      this.gameSession.ai_players.forEach(async (player) => {
        if (!player.scores[currentRound - 1]) {
          const aiResponse = roundData.answers[player.playerName];
    
          if (!aiResponse) {
            console.error("No AI response found for player:", player.playerName);
            return;
          }
    
          try {
            const response = await fetch(`/api/word/${this.gameSession.currentCategory}`);
            const data = await response.json();
            const wordData = data.data.find(
              (w) => w.word.toLowerCase() === aiResponse.word.toLowerCase()
            );
            const count = wordData ? wordData.count : 0;
    
            // Calculate score using the same formula
            const calculatedScore = this.calculateScore(
              aiResponse.word,
              count,
              aiResponse.time
            );
    
            console.log(`AI ${player.playerName} score calculated:`, calculatedScore);
    
            // Pass the calculated score to PlayerScore
            const aiScore = new window.PlayerScore(
              this.gameSession.currentCategory,
              aiResponse.word,
              aiResponse.time,
              calculatedScore  // Add the score here
            );
    
            player.addScore(aiScore);
            this.scoreBoard.recordAIResponse(
              player.playerName,
              aiResponse.word,
              aiResponse.time,
              calculatedScore
            );
          } catch (error) {
            console.error("Error calculating AI score:", error);
          }
        }
      });
    
      this.dispatchGameStateUpdate();
    }
    isValidWord(word, category) {
      console.log(`Checking word: "${word}" for category: "${category}"`);

      const validWordsJson = localStorage.getItem(`validWords_${category}`);
      if (!validWordsJson) {
        console.error(
          `No valid words found in localStorage for category: ${category}`
        );
        return { isValid: false, wordData: null };
      }

      try {
        const validWords = JSON.parse(validWordsJson);
        console.log(
          `Found ${validWords.length} words for category: ${category}`
        );

        // Convert both input word and valid words to lowercase
        const normalizedWord = word.toLowerCase().trim();
        const isValid = validWords.some(
          (validWord) => validWord.toLowerCase().trim() === normalizedWord
        );

        // If valid, find the word data (for count/frequency)
        const wordData = isValid ? { count: 1 } : null; // Default count  1

        console.log(
          `Word "${word}" is ${
            isValid ? "valid" : "invalid"
          } for category ${category}`
        );
        return { isValid, wordData };
      } catch (error) {
        console.error("Error parsing valid words:", error);
        console.log("Raw localStorage content:", validWordsJson);
        return { isValid: false, wordData: null };
      }
    }
    async checkAIResponses(elapsed) {
      if (this.gameSession.isGameOver()) return;
     
      const currentRound = this.gameSession.currentRound;
      if (currentRound > this.totalRounds) {
        this.handleGameOver();
        return;
      }
     
      const roundData = this.gameData.rounds[currentRound - 1];
     
      if (!roundData) {
        console.error("No round data found for round:", currentRound);
        return;
      }
     
      if (!this.initialCategoryDisplayed) {
        this.gameSession.currentCategory = roundData.category;
        this.scoreBoard.currentCategory = roundData.category;
        this.dispatchGameStateUpdate();
        this.initialCategoryDisplayed = true;
      }
     
      // Add immediate response after player submission
      const playerHasSubmitted = this.gameSession.human_player.scores[currentRound - 1];
      
      for (const player of this.gameSession.ai_players) {
        const aiResponse = roundData.answers[player.playerName];
     
        if (!aiResponse) {
          console.error("No AI response found for player:", player.playerName);
          continue;
        }
     
        // Change condition to respond immediately if player has submitted
        if (playerHasSubmitted && 
            (!player.scores[currentRound - 1] ||
             player.scores[currentRound - 1].answer === "")) {
          try {
            const response = await fetch(
              `/api/word/${this.gameSession.currentCategory}`
            );
            const data = await response.json();
            const wordData = data.data.find(
              (w) => w.word.toLowerCase() === aiResponse.word.toLowerCase()
            );
            const count = wordData ? wordData.count : 0;
     
            const calculatedScore = this.calculateScore(
              aiResponse.word,
              count,
              aiResponse.time
            );
     
            const aiScore = new window.PlayerScore(
              this.gameSession.currentCategory,
              aiResponse.word,
              aiResponse.time,
              calculatedScore
            );
     
            player.addScore(aiScore);
            this.scoreBoard.recordAIResponse(
              player.playerName,
              aiResponse.word,
              aiResponse.time,
              calculatedScore
            );
          } catch (error) {
            console.error("Error processing AI response:", error);
          }
        } else if (aiResponse.time <= elapsed &&
                  (!player.scores[currentRound - 1] ||
                   player.scores[currentRound - 1].answer === "")) {
          try {
            const response = await fetch(
              `/api/word/${this.gameSession.currentCategory}`
            );
            const data = await response.json();
            const wordData = data.data.find(
              (w) => w.word.toLowerCase() === aiResponse.word.toLowerCase()
            );
            const count = wordData ? wordData.count : 0;
     
            // Calculate score for AI without updating display
            const calculatedScore = this.calculateScore(
              aiResponse.word,
              count,
              aiResponse.time
            );
     
            const aiScore = new window.PlayerScore(
              this.gameSession.currentCategory,
              aiResponse.word,
              aiResponse.time,
              calculatedScore // Include the calculated score
            );
     
            player.addScore(aiScore);
            this.scoreBoard.recordAIResponse(
              player.playerName,
              aiResponse.word,
              aiResponse.time,
              calculatedScore
            );
          } catch (error) {
            console.error("Error processing AI response:", error);
          }
        }
      }
     
      this.dispatchGameStateUpdate();
     }
    startTimer() {
      this.startTime = Date.now();
      this.initialCategoryDisplayed = false;

      this.timerInterval = setInterval(() => {
        const elapsed = Date.now() - this.startTime;
        document.dispatchEvent(
          new CustomEvent("timerTick", {
            detail: { elapsed },
          })
        );

        if (elapsed >= this.timeLimit) {
          this.handleTimeout();
        }
      }, 100);
    }

    //because of validation need to handle timeouts here now
    handleTimeoutSubmission() {
      const score = this.calculateScore("", 0, this.timeLimit);
      const playerScore = new window.PlayerScore(
        this.gameSession.currentCategory,
        "",
        this.timeLimit,
        score
      );
      this.gameSession.human_player.addScore(playerScore);
      this.scoreBoard.recordAnswer("player", "", this.timeLimit, score);

      this.forceAIResponses();

      if (this.gameSession.currentRound >= this.totalRounds - 1) {
        this.handleGameOver();
      } else if (this.gameSession.advanceRound()) {
        this.startNewRound();
      }
    }

    handleTimeout() {
      clearInterval(this.timerInterval);
      this.handleTimeoutSubmission();
    }
    startNewRound() {
      clearInterval(this.timerInterval);
      this.initialCategoryDisplayed = false;
      this.scoreBoard.advanceRound();
      this.startTimer();
      this.dispatchGameStateUpdate();
    }

    handleGameOver() {
      console.log("Game over!");
      clearInterval(this.timerInterval);

      const finalScores = this.calculateFinalScores();
      this.updateGameStats(finalScores);

      const gameOverEvent = new CustomEvent("gameOver", {
        detail: {
          players: [
            this.gameSession.human_player,
            ...this.gameSession.ai_players,
            this.gameSession.ante_player,
          ],
          finalScores: finalScores,
        },
      });
      document.dispatchEvent(gameOverEvent);
    }
    async updateGameStats(finalScores) {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const accessToken = localStorage.getItem("accessToken");

      if (!isLoggedIn || !accessToken) {
        console.log("User not logged in, skipping stats update");
        return;
      }

      const playerScore =
        finalScores.find(
          (s) => s.name === this.gameSession.human_player.playerName
        )?.score ?? 0;
      const otherScores = finalScores
        .filter((s) => s.name !== this.gameSession.human_player.playerName)
        .map((s) => s.score);
      const isWin = playerScore >= Math.max(...otherScores);

      try {
        const response = await fetch("/api/user/game", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
          body: JSON.stringify({
            win: isWin,
            score: playerScore,
          }),
        });

        console.log(response);

        if (!response.ok) {
          throw new Error(`Failed to update game stats: ${response.status}`);
        }

        console.log("Game stats updated successfully");
      } catch (error) {
        console.error("Error updating game stats:", error);
        if (window.M && window.M.toast) {
          M.toast({
            html: "Failed to update game statistics",
            classes: "red",
            displayLength: 3000,
          });
        }
      }
    }

    calculateFinalScores() {
      const allPlayers = [
        this.gameSession.human_player,
        ...this.gameSession.ai_players,
        this.gameSession.ante_player,
      ];
    
      return allPlayers.map((player) => ({
        name: player.playerName,
        score: player.scores.reduce(
          (sum, score) => sum + (score.score || 0), 
          0
        ),
        scores: player.scores,
      }));
    }
    dispatchGameStateUpdate() {
      const allPlayers = [
        this.gameSession.human_player,
        ...this.gameSession.ai_players,
        this.gameSession.ante_player,
      ];

      const playersWithScores = allPlayers.map((player) => ({
        playerName: player.playerName,
        scores: player.scores,
        totalScore: player.scores.reduce(
          (sum, score) => sum + (score.score || 0),
          0
        ),
      }));

      const gameStateEvent = new CustomEvent("gameStateUpdate", {
        detail: {
          currentRound: this.gameSession.currentRound,
          currentCategory: this.gameSession.currentCategory,
          players: playersWithScores,
          startTime: this.startTime,
        },
      });

      document.dispatchEvent(gameStateEvent);
    }
  }

  window.GameController = GameController;
})(window);
