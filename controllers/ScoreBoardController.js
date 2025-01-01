(function(window) {
    class ScoreBoardController {
    constructor(containerId) {
        this.containerId = containerId;
        this.timerInterval = null;
        this.timeLimit = 7000;
        this.createScoreBoardHTML();
        this.setupMaterializeComponents();
        this.initializeEventListeners();
    }
    

    createScoreBoardHTML() {
        const container = document.getElementById(this.containerId);
        container.innerHTML = `
            <div class="chart-container">
                <h2 class="title">Word Master Challenge</h2>
                <div class="round-display">
                    <h5>Round: <span id="current-round">1</span>/10</h5>
                </div>
                <div class="category-display">
                    <h5>Category: <span id="current-category"></span></h5>
                </div>
                <div class="chart">
                    ${this.createBarContainers()}
                </div>
                <div class="timer-container">
                    <div class="timer-bar"></div>
                </div>
                <div class="input-section">
                    <form id="wordForm">
                        <div class="input-field">
                            <input type="text" id="playerPoints" class="browser-default" placeholder="Enter a word">
                            <button type="submit" class="waves-effect waves-light btn" id="submitPoints">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    createBarContainers() {
        const players = ['player', 'james', 'sofia', 'lucas', 'ante'];
        return players.map(player => `
            <div class="bar-container">
                <div class="bar" id="${player}" data-value="0">
                    <div class="bar-value">0</div>
                </div>
                <div class="player-name">${player.charAt(0).toUpperCase() + player.slice(1)}</div>
            </div>
        `).join('');
    }

    setupMaterializeComponents() {
        // Initialize Materialize components
        const elems = document.querySelectorAll('.modal');
        M.Modal.init(elems, {
            dismissible: false,
            onCloseEnd: () => {
                location.reload();
            }
        });
    }

    initializeEventListeners() {
        document.addEventListener('gameStateUpdate', (e) => this.handleGameStateUpdate(e.detail));
        document.addEventListener('gameOver', (e) => this.handleGameOver(e.detail));
        document.addEventListener('timerTick', (e) => this.updateTimer(e.detail.elapsed));

        const wordForm = document.getElementById('wordForm');
        if (wordForm) {
            wordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleWordSubmission();
            });
        }
    }

    handleGameStateUpdate(gameState) {
        this.updateRoundDisplay(gameState.currentRound);
        this.updateCategoryDisplay(gameState.currentCategory);
        this.updateScoreBars(gameState.players);
    }

    updateTimer(elapsed) {
        const timerBar = document.querySelector('.timer-bar');
        const percentage = (elapsed / this.timeLimit) * 100;
        
        timerBar.style.width = `${Math.min(percentage, 100)}%`;
        
        if (percentage >= 60 && percentage < 80) {
            timerBar.classList.add('warning');
            timerBar.classList.remove('danger');
        } else if (percentage >= 80) {
            timerBar.classList.remove('warning');
            timerBar.classList.add('danger');
        }
    }

    updateRoundDisplay(round) {
        document.getElementById('current-round').textContent = round;
    }

    updateCategoryDisplay(category) {
        document.getElementById('current-category').textContent = category;
    }

    updateScoreBars(players) {
        players.forEach(player => {
            const bar = document.getElementById(player.playerName.toLowerCase());
            if (bar && player.scores.length > 0) {
                const latestScore = player.getLatestScore();
                const height = latestScore.answer.length * 10;
                
                // Animate height change
                bar.style.transition = 'height 0.5s ease-out';
                bar.style.height = `${height}px`;
                
                this.updateValueLabel(bar, latestScore.answer);

                // Add eliminated styling if applicable
                if (player.eliminated) {
                    bar.classList.add('eliminated');
                    if (!bar.querySelector('.eliminated-label')) {
                        const label = document.createElement('div');
                        label.className = 'eliminated-label';
                        label.textContent = 'ELIMINATED';
                        bar.appendChild(label);
                    }
                }
            }
        });
    }

    updateValueLabel(bar, value) {
        const existingLabel = bar.querySelector('.bar-value');
        if (existingLabel) {
            existingLabel.textContent = value;
        } else {
            const valueLabel = document.createElement('div');
            valueLabel.className = 'bar-value';
            valueLabel.textContent = value;
            bar.appendChild(valueLabel);
        }
    }

    handleWordSubmission() {
        const wordInput = document.getElementById('playerPoints');
        const word = wordInput.value.trim();
        
        if (word) {
            document.dispatchEvent(new CustomEvent('wordSubmitted', {
                detail: { word }
            }));
            wordInput.value = '';
            wordInput.focus();
        }
    }

    handleGameOver(gameState) {
        // Create and display modal
        const modalHtml = `
            <div id="gameOverModal" class="modal">
                <div class="modal-content">
                    <h3>Game Over!</h3>
                    <p>Final Scores:</p>
                    <ul>
                        ${this.generateFinalScores(gameState.finalScores)}
                    </ul>
                </div>
                <div class="modal-footer">
                    <a href="#!" class="modal-close waves-effect waves-green btn">Play Again</a>
                </div>
            </div>
        `;

        if (!document.getElementById('gameOverModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            const modal = document.getElementById('gameOverModal');
            M.Modal.init(modal).open();
        }

        // Disable inputs
        const wordInput = document.getElementById('playerPoints');
        const submitButton = document.getElementById('submitPoints');
        if (wordInput) wordInput.disabled = true;
        if (submitButton) submitButton.disabled = true;
    }

    generateFinalScores(scores) {
        return scores
            .map(({name, score}) => `
                <li class="final-score">
                    <span class="player-name">${name}</span>
                    <span class="score">${score}</span>
                </li>
            `)
            .join('');
    }
}


window.ScoreBoardController = ScoreBoardController;
})(window);