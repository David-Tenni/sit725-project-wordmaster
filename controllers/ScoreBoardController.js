(function (window) {
  class ScoreBoardController {
    constructor(containerId, totalRounds = 5) {
      this.containerId = containerId;
      this.timerInterval = null;
      this.timeLimit = 7000;
      this.totalRounds = totalRounds;
      this.players = new Map();
      this.maxBarHeight = 390;

      // Initialize components
      try {
        this.createScoreBoardHTML();
        document.addEventListener("DOMContentLoaded", () => {
          this.setupMaterializeComponents();
        });
        this.initializeEventListeners();
      } catch (error) {
        console.error(
          "Error during ScoreBoardController initialization:",
          error
        );
      }
    }

    addPlayer(playerName) {
      const playerId = playerName.toLowerCase().trim();
      if (!this.players.has(playerId) && playerId !== "ante") {
        // Don't add ANTE player we are probalby removing it for good
        this.players.set(playerId, {
          name: playerName,
          totalScore: 0,
          scores: [],
          eliminated: false,
        });
        this.updateBars();
      }
    }

    updateCategoryDisplay(category) {
      const categoryDisplay = document.getElementById("current-category");
      if (categoryDisplay) {
        categoryDisplay.textContent = category.replace(/_/g, " ");
      } else {
        console.error("Category display element not found.");
      }
    }

    createScoreBoardHTML() {
      const container = document.getElementById(this.containerId);
      if (!container) {
        console.error("Container not found:", this.containerId);
        return;
      }
      container.innerHTML = `
  <div class="chart-container" style="max-width: 600px; margin: 0 auto; padding-top: 0;">
    <h2 class="title" style="margin: 0; padding: 5px 0; text-align: center;">Word Master Challenge</h2>
    
    <div class="scoring-box">
      <h6>Scoring Guide</h6>
      <div class="scoring-detail" id="length-bonus">Length Bonus: --</div>
      <div class="scoring-detail" id="rarity-bonus">Rarity Bonus: --</div>
      <div class="scoring-detail" id="speed-multi">Speed Multi: --</div>
        <hr style="margin: 8px 0; border-top: 1px solid #a388ee;">
  <div class="scoring-detail" id="total-score">Total Score: --</div>
    </div>

    <div style="margin-bottom: 5px;">
      <div class="round-display">
        <h5 style="margin: 5px 0;">Round: <span id="current-round">1</span>/${
          this.totalRounds
        }</h5>
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
      <a href="/mainMenu.html" class="waves-effect waves-light btn btn-custom signup-btn">Main Menu</a>
    </div>
  </div>`;

      const exitButton = document.getElementById("exitGame");
      if (exitButton) {
        exitButton.addEventListener("click", () => {
          window.location.href = "mainMenu.html";
        });
      }
    }
    createBarContainers() {
      return Array.from(this.players.entries())
        .filter(([playerId]) => playerId !== "ante")
        .map(
          ([playerId, playerData]) => `
            <div class="bar-container">
                <div class="bar" id="${playerId}" data-value="0">
                    <div class="word-display" style="position: absolute; width: 100%; text-align: center; top: 10%;">
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
    updateScoringDisplay(lengthBonus, rarityBonus, speedMulti) {
      const lengthElement = document.getElementById("length-bonus");
      const rarityElement = document.getElementById("rarity-bonus");
      const speedElement = document.getElementById("speed-multi");

      if (lengthElement)
        lengthElement.textContent = `Length Bonus: +${lengthBonus}`;
      if (rarityElement)
        rarityElement.textContent = `Rarity Bonus: +${rarityBonus}`;
      if (speedElement)
        speedElement.textContent = `Speed Multi: ×${speedMulti}`;
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

      if (gameState.currentCategory) {
        this.updateCategoryDisplay(gameState.currentCategory);
      }
      this.updateRoundDisplay(gameState.currentRound);

      gameState.players.forEach((player) => {
        if (player.playerName.toLowerCase() !== "ante") {
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
      const MAX_POSSIBLE_SCORE = 70;
      
      // Get current round
      const currentRound = document.getElementById("current-round");
      const isFirstRound = currentRound && currentRound.textContent === "1";
    
      // Only calculate highest score if not first round
      const highestScore = !isFirstRound ? Math.max(...players.map(player => 
        player.scores.reduce((sum, score) => sum + (score.score || 0), 0)
      )) : 0;
    
      players.forEach((player) => {
        if (player.playerName.toLowerCase() === "ante") return;
    
        const playerId = player.playerName.toLowerCase().trim();
        const bar = document.getElementById(playerId);
    
        if (!bar) {
          console.warn(`Bar not found for player: ${player.playerName}`);
          this.addPlayer(player.playerName);
          return;
        }
    
        const totalScore = player.scores.reduce(
          (sum, score) => sum + (score.score || 0),
          0
        );
    
        const height = Math.min(
          (totalScore / MAX_POSSIBLE_SCORE) * this.maxBarHeight,
          this.maxBarHeight
        );
    
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
    
        const wordDisplay = bar.querySelector(".current-word");
        if (wordDisplay) {
          wordDisplay.textContent = latestScore ? latestScore.answer : "";
        }
    
        // Only show crown after first round
        const scoreDisplay = bar.querySelector(".total-score");
        if (scoreDisplay) {
          scoreDisplay.textContent = `Total: ${totalScore}${(!isFirstRound && totalScore === highestScore) ? ' 👑' : ''}`;
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
      const modal = document.getElementById("gameOverModal");
      if (!modal) {
        console.error("Game over modal not found");
        return;
      }

      const scoresList = modal.querySelector(".final-scores-list");
      if (scoresList) {
        scoresList.innerHTML = this.generateFinalScores(
          gameState.finalScores.filter(
            (score) => score.name.toLowerCase() !== "ante"
          )
        );
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
      
      // Find highest score
      const highestScore = Math.max(...scores.map(score => score.score));
      
      return scores
        .sort((a, b) => b.score - a.score) // Sort by score in descending order
        .map(
          ({ name, score }) => `
            <li class="final-score">
              <a  href="/user/${name}"  class="username-link">${name}${score === highestScore ? ' 👑' : ''}</a>
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
