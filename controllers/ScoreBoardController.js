(function(window) {
    class ScoreBoardController {
        constructor(containerId) {
            console.log('ScoreBoardController initializing...');
            this.containerId = containerId;
            this.timerInterval = null;
            this.timeLimit = 7000;
            this.createScoreBoardHTML();
            this.setupMaterializeComponents();
            this.initializeEventListeners();
        }
        
        createScoreBoardHTML() {
            console.log('Creating ScoreBoard HTML...');
            const container = document.getElementById(this.containerId);
            if (!container) {
                console.error('Container not found:', this.containerId);
                return;
            }
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
                        <div class="bar-value">
                            <div class="current-word"></div>
                            <div class="total-score">Total: 0</div>
                        </div>
                    </div>
                    <div class="player-name">${player.charAt(0).toUpperCase() + player.slice(1)}</div>
                </div>
            `).join('');
        }

        setupMaterializeComponents() {
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
            console.log('Received game state update:', gameState);
            if (gameState.currentCategory) {
                this.updateCategoryDisplay(gameState.currentCategory);
            }
            this.updateRoundDisplay(gameState.currentRound);
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
                if (!bar) return;

                // Calculate total height based on cumulative score
                const totalScore = player.scores.reduce((sum, score) => sum + score.answer.length, 0);
                const height = totalScore * 10; 
                
                // Animate height change
                bar.style.transition = 'height 0.5s ease-out';
                bar.style.height = `${height}px`;
                
                // Get the latest score
                const latestScore = player.scores[player.scores.length - 1];
                this.updateValueLabel(bar, {
                    latest: latestScore ? latestScore.answer : '',
                    total: totalScore
                });

                // Handle eliminated status
                if (player.eliminated) {
                    bar.classList.add('eliminated');
                    if (!bar.querySelector('.eliminated-label')) {
                        const label = document.createElement('div');
                        label.className = 'eliminated-label';
                        label.textContent = 'ELIMINATED';
                        bar.appendChild(label);
                    }
                }
            });
        }

        updateValueLabel(bar, values) {
            const valueLabel = bar.querySelector('.bar-value');
            if (valueLabel) {
                const currentWord = valueLabel.querySelector('.current-word');
                const totalScore = valueLabel.querySelector('.total-score');
                
                if (currentWord) currentWord.textContent = values.latest;
                if (totalScore) totalScore.textContent = `Total: ${values.total}`;
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