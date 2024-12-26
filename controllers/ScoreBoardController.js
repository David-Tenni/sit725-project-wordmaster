(function(window) {
  class ScoreBoardController {
    constructor(model, containerId) {
      this.model = model;
      this.containerId = containerId;
      this.timerInterval = null;
      this.timeLimit = 7000; // 7 seconds in milliseconds
      this.startTime = null;
      this.createScoreBoardHTML();
      this.initializeEventListeners();
      this.updateView();
    }

    createScoreBoardHTML() {
      const container = document.getElementById(this.containerId);
      container.innerHTML = `
        <div class="chart-container">
          <h2 class="title">Word Master Challenge</h2>
          <div class="round-display">
            <h5>Round: <span id="current-round">${this.model.getCurrentRound()}</span>/10</h5>
          </div>
          <div class="category-display">
            <h5>Category: <span id="current-category">${this.model.getCurrentCategory()}</span></h5>
          </div>
          <div class="chart">
            ${this.createBarContainers()}
          </div>
          <div class="timer-container">
            <div class="timer-bar"></div>
          </div>
        </div>
      `;
    }

    createBarContainers() {
      const players = ['player', 'james', 'sofia', 'lucas', 'ante'];
      return players.map(player => `
        <div class="bar-container">
          <div class="bar" id="${player}" data-value="0"></div>
          <div class="player-name">${player.charAt(0).toUpperCase() + player.slice(1)}</div>
        </div>
      `).join('');
    }

    initializeEventListeners() {
      console.log("Initializing event listeners");
      const wordForm = document.getElementById("wordForm");
      console.log("Word form found:", wordForm);

      if (wordForm) {
        wordForm.addEventListener("submit", (e) => {
          e.preventDefault();
          console.log("Form submitted");
          const wordInput = document.getElementById("playerPoints");
          const word = wordInput.value.trim();
          console.log("Word entered:", word);

          if (word) {
            const responseTime = Date.now() - this.startTime;
            this.model.recordAnswer("player", word, responseTime);

            // Update displays
            this.updateView();
            wordInput.value = "";
            
            // Stop current timer and start new one for next round
            this.stopTimer();
            
            if (this.model.getCurrentRound() <= 10) {
              this.startTimer();
            } else {
              this.handleGameOver();
            }
          }
        });
      } else {
        console.error("Word form not found!");
      }

      // Start initial timer
      this.startTimer();
    }

    startTimer() {
      const timerBar = document.querySelector('.timer-bar');
      const wordInput = document.getElementById('playerPoints');
      const submitButton = document.getElementById('submitPoints');
      
      // Reset timer state
      clearInterval(this.timerInterval);
      this.startTime = Date.now();
      timerBar.style.width = '0%';
      timerBar.classList.remove('warning', 'danger');
      
      this.timerInterval = setInterval(() => {
        const elapsed = Date.now() - this.startTime;
        const percentage = (elapsed / this.timeLimit) * 100;
        
        // Update timer bar
        timerBar.style.width = `${Math.min(percentage, 100)}%`;
        
        // Add warning classes
        if (percentage >= 60 && percentage < 80) {
          timerBar.classList.add('warning');
          timerBar.classList.remove('danger');
        } else if (percentage >= 80) {
          timerBar.classList.remove('warning');
          timerBar.classList.add('danger');
        }
        
        // Time's up!
        if (elapsed >= this.timeLimit) {
          clearInterval(this.timerInterval);
          
          // Submit 'a' as default answer
          if (wordInput && submitButton) {
            wordInput.value = 'a';
            submitButton.click();
          }
        }
      }, 100);
    }

    stopTimer() {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    updateView() {
      const bars = document.querySelectorAll(".bar");
      bars.forEach((bar) => {
        const playerId = bar.id;
        const value = this.model.getPlayerScore(playerId);
        console.log(`Updating ${playerId} with value ${value}`);

        bar.style.height = `${value * 10}px`;
        bar.setAttribute("data-value", value);

        this.updateValueLabel(bar, value);
      });

      // Update the current category and round
      document.getElementById("current-category").textContent = this.model.getCurrentCategory();
      document.getElementById("current-round").textContent = this.model.getCurrentRound();
    }

    updateValueLabel(bar, value) {
      const existingLabel = bar.querySelector(".bar-value");
      if (existingLabel) {
        existingLabel.remove();
      }

      const valueLabel = document.createElement("div");
      valueLabel.className = "bar-value";
      valueLabel.textContent = value.toString();
      bar.appendChild(valueLabel);
    }

    handleGameOver() {
      this.stopTimer();
      const container = document.getElementById(this.containerId);
      const gameOverDiv = document.createElement('div');
      gameOverDiv.className = 'game-over';
      gameOverDiv.innerHTML = `
        <h3>Game Over!</h3>
        <p>Final Scores:</p>
        <ul>
          ${this.generateFinalScores()}
        </ul>
        <p>Thanks for playing!</p>
      `;
      container.appendChild(gameOverDiv);
    }

    generateFinalScores() {
      const players = ['Player', 'James', 'Sofia', 'Lucas', 'ANTE'];
      return players.map(playerName => {
        const score = this.model.getPlayerScore(playerName);
        return `<li>${playerName}: ${score}</li>`;
      }).join('');
    }
  }

  window.ScoreBoardController = ScoreBoardController;
})(window);