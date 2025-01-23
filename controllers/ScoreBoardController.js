(function (window) {
  class ScoreBoardController {
    constructor(containerId, totalRounds = 5) {
      console.log("ScoreBoardController initializing...");
      this.containerId = containerId;
      this.timerInterval = null;
      this.timeLimit = 7000;
      this.totalRounds = totalRounds;
      this.players = new Map();
      this.maxBarHeight = 500; // Set maximum height for bars

      // Initialize components
      try {
        this.createScoreBoardHTML();
        document.addEventListener("DOMContentLoaded", () => {
          this.setupMaterializeComponents();
        });
        this.initializeEventListeners();
        console.log("ScoreBoardController initialization complete");
      } catch (error) {
        console.error("Error during ScoreBoardController initialization:", error);
      }
    }

    addPlayer(playerName) {
      const playerId = playerName.toLowerCase().trim();
      if (!this.players.has(playerId) && playerId !== 'ante') { // Don't add ANTE player
        this.players.set(playerId, {
          name: playerName,
          totalScore: 0,
          scores: [],
          eliminated: false,
        });
        console.log(`Added player: ${playerName}`);
        this.updateBars();
      }
    }

    updateCategoryDisplay(category) {
      const categoryDisplay = document.getElementById("current-category");
      if (categoryDisplay) {
        categoryDisplay.textContent = category;
      } else {
        console.error("Category display element not found.");
      }
    }

    createScoreBoardHTML() {
      console.log("Creating ScoreBoard HTML...");
      const container = document.getElementById(this.containerId);
      if (!container) {
        console.error("Container not found:", this.containerId);
        return;
      }
      container.innerHTML = `
             <div class="chart-container" style="max-width: 600px; margin: 0 auto; padding-top: 0;">
                    <h2 class="title" style="margin: 0; padding: 5px 0; text-align: center;">Word Master Challenge</h2>
                    <div style="margin-bottom: 5px;">
                        <div class="round-display">
                            <h5 style="margin: 5px 0;">Round: <span id="current-round">1</span>/${this.totalRounds}</h5>
                        </div>
                        <div class="category-display">
                            <h5 style="margin: 5px 0;">Category: <span id="current-category"></span></h5>
                        </div>
                    </div>
                    <div class="chart" style="height: 50vh; margin: 10px 0;">
                        ${this.createBarContainers()}
                    </div>
                    <div class="timer-container">
                        <div class="timer-bar"></div>
                    </div>
                    <div class="input-section" style="margin: 10px 0;">
                        <form id="wordForm">
                            <div class="input-field">
                                <input type="text" id="playerPoints" autofocus class="browser-default" placeholder="Enter a word">
                                <button type="submit" class="waves-effect waves-light btn" id="submitPoints">Submit</button>
                            </div>
                        </form>
                    </div>
                    <div style="text-align: center; margin: 10px 0;">
                        <button class="waves-effect waves-light btn" id="exitGame">EXIT GAME</button>
                    </div>
                </div>

                <div id="gameOverModal" class="modal">
                    <div class="modal-content">
                        <h3>Game Over!</h3>
                        <p>Final Scores:</p>
                        <ul class="final-scores-list">
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <a href="/index.html" class="waves-effect waves-light btn btn-custom play-btn">Play Again</a>
                        <a href="/leaderboard.html" class="waves-effect waves-light btn btn-custom signup-btn">LeaderBoard</a>
                        <a href="/mainmenu.html" class="waves-effect waves-light btn btn-custom signup-btn">Main Menu</a>
                    </div>
                </div>`;

      const exitButton = document.getElementById('exitGame');
      if (exitButton) {
        exitButton.addEventListener('click', () => {
          window.location.href = 'mainmenu.html';
        });
      }
}
    createBarContainers() {
      return Array.from(this.players.entries())
        .filter(([playerId]) => playerId !== 'ante')
        .map(
          ([playerId, playerData]) => `
            <div class="bar-container">
                <div class="bar" id="${playerId}" data-value="0">
                    <div class="word-display" style="position: absolute; width: 100%; text-align: center; top: 40%;">
                        <div class="current-word" style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);"></div>
                    </div>
                    <div class="score-display" style="position: absolute; width: 100%; text-align: center; top: 60%;">
                        <div class="total-score" style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">Total: 0</div>
                    </div>
                </div>
                <div class="player-name">${playerData.name}</div>
            </div>
          `
        )
        .join("");
    }

    updateBars() {
      const chart = document.querySelector(".chart");
      if (chart) {
        chart.innerHTML = this.createBarContainers();
      }
    }

    updateRoundDisplay(round) {
      const roundDisplay = document.getElementById("current-round");
      if (roundDisplay) {
        roundDisplay.textContent = round;
      } else {
        console.error("Round display element not found.");
      }
    }

    handleGameStateUpdate(gameState) {
      console.log("Received game state update:", gameState);

      if (gameState.currentCategory) {
        this.updateCategoryDisplay(gameState.currentCategory);
      }
      this.updateRoundDisplay(gameState.currentRound);

      gameState.players.forEach((player) => {
        if (player.playerName.toLowerCase() !== 'ante') {
          this.addPlayer(player.playerName);
        }
      });

      this.updateScoreBars(gameState.players);
    }

    updateTimer(elapsed) {
      const timerBar = document.querySelector(".timer-bar");
      if (timerBar) {
        const progress = Math.min(elapsed / this.timeLimit, 1);
        timerBar.style.width = `${progress * 100}%`;
      } else {
        console.error("Timer bar element not found.");
      }
    }

    updateScoreBars(players) {
      players.forEach((player) => {
        if (player.playerName.toLowerCase() === 'ante') return;
        
        const playerId = player.playerName.toLowerCase().trim();
        const bar = document.getElementById(playerId);
    
        if (!bar) {
          console.warn(`Bar not found for player: ${player.playerName}`);
          this.addPlayer(player.playerName);
          return;
        }
    
        const totalScore = player.scores.reduce(
          (sum, score) => sum + score.answer.length,
          0
        );
    
        const height = Math.min((totalScore * 10), this.maxBarHeight);
    
        bar.style.transition = "height 0.5s ease-out";
        bar.style.height = `${height}px`;
    
        if (playerId === "player") {
          bar.style.backgroundColor = "#2196F3";
        } else {
          if (!bar.style.backgroundColor || bar.style.backgroundColor === "transparent") {
            const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
            bar.style.backgroundColor = randomColor;
          }
        }
    
        const latestScore = player.scores[player.scores.length - 1];
        
        // Update word display
        const wordDisplay = bar.querySelector('.current-word');
        if (wordDisplay) {
          wordDisplay.textContent = latestScore ? latestScore.answer : "";
        }
    
        // Update score display
        const scoreDisplay = bar.querySelector('.total-score');
        if (scoreDisplay) {
          scoreDisplay.textContent = `Total: ${totalScore}`;
        }
      });
    }
    updateValueLabel(bar, values) {
      const valueLabel = bar.querySelector(".bar-value");
      if (valueLabel) {
        const currentWord = valueLabel.querySelector(".current-word");
        const totalScore = valueLabel.querySelector(".total-score");

        if (currentWord) currentWord.textContent = values.latest;
        if (totalScore) totalScore.textContent = `Total: ${values.total}`;
      }
    }

    handleWordSubmission() {
      const wordInput = document.getElementById("playerPoints");
      const word = wordInput.value.trim();

      if (word) {
        document.dispatchEvent(
          new CustomEvent("wordSubmitted", {
            detail: { word },
          })
        );
        wordInput.value = "";
        wordInput.focus();
      }
    }

    handleGameOver(gameState) {
      console.log("Game Over triggered with state:", gameState);

      const modal = document.getElementById("gameOverModal");
      if (!modal) {
        console.error("Game over modal not found");
        return;
      }

      const scoresList = modal.querySelector(".final-scores-list");
      if (scoresList) {
        scoresList.innerHTML = this.generateFinalScores(gameState.finalScores.filter(score => score.name.toLowerCase() !== 'ante'));
      }

      const modalInstance = M.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.open();
      } else {
        const newInstance = M.Modal.init(modal, {
          dismissible: false,
          onCloseEnd: () => {
            location.reload();
          },
        });
        newInstance.open();
      }

      const wordInput = document.getElementById("playerPoints");
      const submitButton = document.getElementById("submitPoints");
      if (wordInput) wordInput.disabled = true;
      if (submitButton) submitButton.disabled = true;
    }

    generateFinalScores(scores) {
      console.log("Generating final scores:", scores);
      return scores
        .map(
          ({ name, score }) => `
                    <li class="final-score">
                        <span class="player-name">${name}</span>
                        <span class="score">${score} points</span>
                    </li>
                `
        )
        .join("");
    }

    setupMaterializeComponents() {
      try {
        if (typeof M === "undefined") {
          console.error("Materialize is not loaded");
          return;
        }

        const modal = document.getElementById("gameOverModal");
        if (modal) {
          M.Modal.init(modal, {
            dismissible: false,
            onCloseEnd: () => location.reload(),
          });
          console.log("Modal initialized successfully");
        }

        M.AutoInit();
      } catch (error) {
        console.error("Error initializing Materialize components:", error);
      }
    }

    initializeEventListeners() {
      document.addEventListener("gameStateUpdate", (e) =>
        this.handleGameStateUpdate(e.detail)
      );
      document.addEventListener("gameOver", (e) =>
        this.handleGameOver(e.detail)
      );
      document.addEventListener("timerTick", (e) =>
        this.updateTimer(e.detail.elapsed)
      );

      const wordForm = document.getElementById("wordForm");
      if (wordForm) {
        wordForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.handleWordSubmission();
        });
      }
    }
  }

  window.ScoreBoardController = ScoreBoardController;
})(window);