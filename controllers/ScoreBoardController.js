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
        <h2 class="title">Score Board</h2>
        <div class="buttons">
          <button class="waves-effect waves-light btn" data-action="reset">Reset & Animate</button>
          <button class="waves-effect waves-light btn" data-action="grow">Add Points</button>
          <button class="waves-effect waves-light btn red" data-action="eliminate-lowest">Eliminate Lowest</button>
          <button class="waves-effect waves-light btn red" data-action="eliminate-below-ante">Eliminate Below ANTE</button>
        </div>
        <div class="chart">
          <div class="bar-container">
            <div class="bar" id="player" data-value="0"></div>
            <div class="player-name">Player</div>
          </div>
          <div class="bar-container">
            <div class="bar" id="james" data-value="0"></div>
            <div class="player-name">James</div>
          </div>
          <div class="bar-container">
            <div class="bar" id="sofia" data-value="0"></div>
            <div class="player-name">Sofia</div>
          </div>
          <div class="bar-container">
            <div class="bar" id="lucas" data-value="0"></div>
            <div class="player-name">Lucas</div>
          </div>
          <div class="bar-container" id="ante-container">
            <div class="bar" id="ante" data-value="0"></div>
            <div class="player-name">ANTE</div>
          </div>
        </div>
        <div class="round-display">
          <h5>Round: <span id="current-round">${this.model.currentRound}</span></h5>
        </div>
        <div class="category-display">
          <h5>Category: <span id="current-category">${this.model.currentCategory}</span></h5>
        </div>
        <div class="timer-container">
          <div class="timer-bar"></div>
        </div>
      </div>
    `;
  }

  initializeEventListeners() {
    document
      .querySelector('[data-action="reset"]')
      .addEventListener("click", () => this.resetAndAnimate());
    document
      .querySelector('[data-action="grow"]')
      .addEventListener("click", () => this.growBars());
    document
      .querySelector('[data-action="eliminate-lowest"]')
      .addEventListener("click", () => this.eliminateLowest());
    document
      .querySelector('[data-action="eliminate-below-ante"]')
      .addEventListener("click", () => this.eliminateBelowAnte());

    console.log("Initializing event listeners");

    const wordForm = document.getElementById("wordForm");
    console.log("Word form found:", wordForm);

    if (wordForm) {
      wordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Form submitted");
        const wordInput = document.getElementById("playerPoints");
        const word = wordInput.value.trim();
        const wordLength = word.length;
        console.log("Word entered:", word, "Length:", wordLength);

        this.model.currentCategory = this.model.getRandomCategory();
        document.getElementById("current-category").textContent =
          this.model.currentCategory;
        this.model.currentRound += 1;
        document.getElementById("current-round").textContent = this.model.currentRound;

        const currentScore = this.model.getScore("player");
        const newScore = currentScore + wordLength;
        console.log(
          "Current score:",
          currentScore,
          "Word length:",
          wordLength,
          "New score:",
          newScore
        );

        this.model.scores.set("player", newScore);

        this.model.players.forEach((p) => {
          if (p !== "player" && !this.model.eliminated.has(p)) {
            const currentValue = this.model.getScore(p);
            const growthRange =
              this.model.BASE_GROWTH * this.model.GROWTH_VARIATION * 2;
            const randomGrowth =
              this.model.BASE_GROWTH * (1 - this.model.GROWTH_VARIATION) +
              Math.random() * growthRange;
            this.model.scores.set(p, currentValue + randomGrowth);
          }
        });

        this.updateView();
        wordInput.value = "";
        
        // Stop current timer and start new one for next round
        this.stopTimer();
        this.startTimer();
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
    }, 100); // Update every 100ms for smooth animation
  }

  stopTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  updateView() {
    const bars = document.querySelectorAll(".bar");
    bars.forEach((bar) => {
      const playerId = bar.id;
      const value = this.model.getScore(playerId);
      console.log(`Updating ${playerId} with value ${value}`);

      bar.style.height = `${value * 10}px`;
      bar.setAttribute("data-value", value);

      this.updateValueLabel(bar, value);

      if (this.model.eliminated.has(playerId)) {
        this.markAsEliminated(bar);
      }
    });

    this.updateCrown();
  }

  updateValueLabel(bar, value) {
    const existingLabel = bar.querySelector(".bar-value");
    if (existingLabel) {
      existingLabel.remove();
    }

    const valueLabel = document.createElement("div");
    valueLabel.className = "bar-value";
    valueLabel.textContent = Math.round(value * 10) / 10;
    bar.appendChild(valueLabel);
  }

  updateCrown() {
    // Remove existing crowns
    document.querySelectorAll(".bar-value").forEach((label) => {
      label.textContent = label.textContent.replace(" 👑", "");
    });

    const highestPlayer = this.model.getHighestPlayer();
    if (highestPlayer) {
      const highestBar = document.getElementById(highestPlayer);
      const valueLabel = highestBar.querySelector(".bar-value");
      if (valueLabel) {
        valueLabel.textContent += " 👑";
      }
    }
  }

  resetAndAnimate() {
    this.model.resetScores();

    const bars = document.querySelectorAll(".bar");
    bars.forEach((bar) => {
      bar.style.height = "0";
      bar.classList.remove("eliminated");
    });

    document
      .querySelectorAll(".eliminated-label")
      .forEach((label) => label.remove());

    document.getElementById("current-round").textContent = this.model.currentRound;
    document.getElementById("current-category").textContent = this.model.currentCategory;
    
    // Reset and restart timer
    this.stopTimer();
    setTimeout(() => {
      this.updateView();
      this.startTimer();
    }, 100);
  }

  growBars() {
    this.model.growScores();
    this.updateView();
  }

  eliminateLowest() {
    this.model.eliminateLowest();
    this.updateView();
  }

  eliminateBelowAnte() {
    this.model.eliminateBelowAnte();
    this.updateView();
  }

  markAsEliminated(bar) {
    bar.classList.add("eliminated");
    if (!bar.querySelector(".eliminated-label")) {
      const label = document.createElement("div");
      label.className = "eliminated-label";
      label.textContent = "ELIMINATED";
      bar.appendChild(label);
    }
  }
}

export default ScoreBoardController;