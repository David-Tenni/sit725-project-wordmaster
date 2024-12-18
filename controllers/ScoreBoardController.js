class ScoreBoardController {
  constructor(model, containerId) {
    this.model = model;
    this.containerId = containerId;
    this.initialize();
  }

  initialize() {
    this.createScoreBoardHTML();
    this.initializeEventListeners();
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
            <div class="bar" id="emma" data-value="0"></div>
            <div class="bar-label">Emma</div>
          </div>
          <div class="bar-container">
            <div class="bar" id="james" data-value="0"></div>
            <div class="bar-label">James</div>
          </div>
          <div class="bar-container">
            <div class="bar" id="sofia" data-value="0"></div>
            <div class="bar-label">Sofia</div>
          </div>
          <div class="bar-container">
            <div class="bar" id="lucas" data-value="0"></div>
            <div class="bar-label">Lucas</div>
          </div>
          <div class="bar-container" id="ante-container">
            <div class="bar" id="ante" data-value="0"></div>
            <div class="bar-label">ANTE</div>
          </div>
        </div>
      </div>
    `;
  }

  initializeEventListeners() {
    document.querySelector('[data-action="reset"]').addEventListener('click', () => this.resetAndAnimate());
    document.querySelector('[data-action="grow"]').addEventListener('click', () => this.growBars());
    document.querySelector('[data-action="eliminate-lowest"]').addEventListener('click', () => this.eliminateLowest());
    document.querySelector('[data-action="eliminate-below-ante"]').addEventListener('click', () => this.eliminateBelowAnte());
  }

  updateView() {
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
      const playerId = bar.id;
      const value = this.model.getScore(playerId);
      
      // Update height and value
      bar.style.height = (value * 3) + 'px';
      bar.setAttribute('data-value', value);
      
      // Update value label
      this.updateValueLabel(bar, value);
      
      // Update elimination status
      if (this.model.isEliminated(playerId)) {
        this.markAsEliminated(bar);
      }
    });

    this.updateCrown();
  }

  updateValueLabel(bar, value) {
    const existingLabel = bar.querySelector('.bar-value');
    if (existingLabel) {
      existingLabel.remove();
    }
    
    const valueLabel = document.createElement('div');
    valueLabel.className = 'bar-value';
    valueLabel.textContent = Math.round(value * 10) / 10;
    bar.appendChild(valueLabel);
  }

  updateCrown() {
    // Remove existing crowns
    document.querySelectorAll('.bar-value').forEach(label => {
      label.textContent = label.textContent.replace(' 👑', '');
    });

    const highestPlayer = this.model.getHighestPlayer();
    if (highestPlayer) {
      const highestBar = document.getElementById(highestPlayer);
      const valueLabel = highestBar.querySelector('.bar-value');
      if (valueLabel) {
        valueLabel.textContent += ' 👑';
      }
    }
  }

  resetAndAnimate() {
    this.model.resetScores();
    
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
      bar.style.height = '0';
      bar.classList.remove('eliminated');
    });

    document.querySelectorAll('.eliminated-label').forEach(label => label.remove());
    
    setTimeout(() => this.updateView(), 100);
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
    bar.classList.add('eliminated');
    if (!bar.querySelector('.eliminated-label')) {
      const label = document.createElement('div');
      label.className = 'eliminated-label';
      label.textContent = 'ELIMINATED';
      bar.appendChild(label);
    }
  }
}

export default ScoreBoardController;