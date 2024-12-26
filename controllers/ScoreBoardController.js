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

          if (word && !this.model.hasPlayerResponded()) {
            const responseTime = Date.now() - this.startTime;
            this.model.recordAnswer("player", word, responseTime);
            this.updateView();
            wordInput.value = "";
          }
        });
      } else {
        console.error("Word form not found!");
      }

      // Start initial timer
      this.startTimer();
    }

    startTimer() {
      // Don't start timer if game is over
      if (this.model.getCurrentRound() > 10) {
        this.handleGameOver();
        return;
      }

      const timerBar = document.querySelector('.timer-bar');
      const wordInput = document.getElementById('playerPoints');
      const submitButton = document.getElementById('submitPoints');
      
      // Reset timer state
      clearInterval(this.timerInterval);
      this.startTime = Date.now();
      timerBar.style.width = '0%';
      timerBar.classList.remove('warning', 'danger');
      
      // Prepare AI responses for this round
      this.model.prepareAIResponses();
      
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
        
        // Check for AI responses based on their individual times
        if (!this.model.isRoundComplete()) {
          this.model.checkAIResponses(elapsed);
          this.updateView();
        }
        
        // Time's up or round complete!
        if (elapsed >= this.timeLimit || this.model.isRoundComplete()&&this.playerHasResponded()) {
          // If player hasn't submitted, submit default answer
          if (!this.model.hasPlayerResponded() && wordInput && submitButton) {
            wordInput.value = 'a';
            submitButton.click();
          }
          
          this.stopTimer();
          
          if (this.model.getCurrentRound() <= 10) {
            // Slight delay before starting next round
            setTimeout(() => {
              this.model.advanceRound();
              this.startTimer();
            }, 1000);
          } else {
            this.handleGameOver();
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

        this.updateValueLabel(bar);
      });

      // Update the current category and round
      document.getElementById("current-category").textContent = this.model.getCurrentCategory();
      document.getElementById("current-round").textContent = this.model.getCurrentRound();
    }

    updateValueLabel(bar) {
      const existingLabel = bar.querySelector(".bar-value");
      if (existingLabel) {
        existingLabel.remove();
      }

      const valueLabel = document.createElement("div");
      valueLabel.className = "bar-value";
      
      // Show the latest answer instead of just the score
      const playerId = bar.id;
      const answer = this.model.getLatestAnswer(playerId);
      valueLabel.textContent = answer || '0';
      
      bar.appendChild(valueLabel);
    }

    handleGameOver() {
      this.stopTimer();
      
      // Create and show modal
      const modalHtml = `
        <div id="gameOverModal" class="modal">
          <div class="modal-content">
            <h3>Game Over!</h3>
            <p>Final Scores:</p>
            <ul>
              ${this.generateFinalScores()}
            </ul>
            <p>Thanks for playing!</p>
          </div>
          <div class="modal-footer">
            <a href="#!" class="modal-close waves-effect waves-green btn-flat">Close</a>
          </div>
        </div>
      `;

      // Add modal to document if it doesn't exist
      if (!document.getElementById('gameOverModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
      }

      // Initialize and open modal
      const modalElement = document.getElementById('gameOverModal');
      const modalInstance = M.Modal.init(modalElement, {
        dismissible: true,
        onCloseEnd: () => {
          console.log('Game over modal closed');
        }
      });
      
      modalInstance.open();

      // Disable input
      const wordInput = document.getElementById('playerPoints');
      const submitButton = document.getElementById('submitPoints');
      if (wordInput) wordInput.disabled = true;
      if (submitButton) submitButton.disabled = true;
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