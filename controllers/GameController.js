const GameSession = require('../models/GameSession');
const Player = require('../models/Player');
const PlayerScore = require('../models/PlayerScore');

class GameController {
    constructor(containerId) {
        this.containerId = containerId;
        this.timeLimit = 7000; // 7 seconds in milliseconds
        this.timerInterval = null;
        this.startTime = null;

        // Initialize players and game session
        this.initializeGame();
        this.createGameHTML();
        this.initializeEventListeners();
        this.updateView();
        this.startTimer();
    }

    initializeGame() {
        // Create AI players with predefined names
        const aiPlayers = [
            new Player(1, 'James'),
            new Player(2, 'Sofia'),
            new Player(3, 'Lucas')
        ];

        // Create human player
        const humanPlayer = new Player(4, 'Player');

        // Create ANTE player
        const antePlayer = new Player(5, 'ANTE');

        // Initialize game session
        this.gameSession = new GameSession(aiPlayers, humanPlayer, antePlayer);
    }

    createGameHTML() {
        const container = document.getElementById(this.containerId);
        container.innerHTML = `
            <div class="chart-container">
                <h2 class="title">Word Master Challenge</h2>
                <div class="round-display">
                    <h5>Round: <span id="current-round">${this.gameSession.currentRound}</span>/10</h5>
                </div>
                <div class="category-display">
                    <h5>Category: <span id="current-category">${this.gameSession.currentCategory}</span></h5>
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
        const allPlayers = [
            this.gameSession.human_player,
            ...this.gameSession.ai_players,
            this.gameSession.ante_player
        ];

        return allPlayers.map(player => `
            <div class="bar-container">
                <div class="bar" id="${player.playerName.toLowerCase()}" data-value="0"></div>
                <div class="player-name">${player.playerName}</div>
            </div>
        `).join('');
    }

    initializeEventListeners() {
        const wordForm = document.getElementById('wordForm');
        if (wordForm) {
            wordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleWordSubmission();
            });
        }
    }

    handleWordSubmission() {
        const wordInput = document.getElementById('playerPoints');
        const word = wordInput.value.trim();
        
        if (word) {
            // Record human player's answer
            const responseTime = Date.now() - this.startTime;
            const playerScore = new PlayerScore(
                this.gameSession.currentCategory,
                word,
                responseTime
            );
            this.gameSession.human_player.addScore(playerScore);

            // Generate and record AI player responses
            this.generateAIResponses();

            // Update ANTE score and advance round
            this.gameSession.advanceRound();

            // Update view and reset for next round
            this.updateView();
            wordInput.value = '';
            this.stopTimer();
            
            if (!this.gameSession.isGameOver()) {
                this.startTimer();
            } else {
                this.handleGameOver();
            }
        }
    }

    generateAIResponses() {
        // Simulate AI players submitting answers
        // This is where you'd normally fetch from historical data
        this.gameSession.ai_players.forEach(player => {
            const simulatedWord = this.generateSimulatedWord();
            const aiScore = new PlayerScore(
                this.gameSession.currentCategory,
                simulatedWord,
                Math.random() * 7000 // Random response time up to 7 seconds
            );
            player.addScore(aiScore);
        });
    }

    generateSimulatedWord() {
        // Temporary simulation - replace with actual historical data
        const wordLengths = [3, 4, 5, 6, 7, 8];
        const length = wordLengths[Math.floor(Math.random() * wordLengths.length)];
        return 'A'.repeat(length); // Placeholder response
    }

    startTimer() {
        const timerBar = document.querySelector('.timer-bar');
        this.startTime = Date.now();
        timerBar.style.width = '0%';
        timerBar.classList.remove('warning', 'danger');
        
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const percentage = (elapsed / this.timeLimit) * 100;
            
            timerBar.style.width = `${Math.min(percentage, 100)}%`;
            
            if (percentage >= 60 && percentage < 80) {
                timerBar.classList.add('warning');
                timerBar.classList.remove('danger');
            } else if (percentage >= 80) {
                timerBar.classList.remove('warning');
                timerBar.classList.add('danger');
            }
            
            if (elapsed >= this.timeLimit) {
                this.handleTimeout();
            }
        }, 100);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    handleTimeout() {
        this.stopTimer();
        const wordInput = document.getElementById('playerPoints');
        const submitButton = document.getElementById('submitPoints');
        
        if (wordInput && submitButton) {
            wordInput.value = 'a'; // Default minimum answer
            submitButton.click();
        }
    }

    updateView() {
        // Update round and category display
        document.getElementById('current-round').textContent = this.gameSession.currentRound;
        document.getElementById('current-category').textContent = this.gameSession.currentCategory;

        // Update score bars
        const updateBar = (player) => {
            const bar = document.getElementById(player.playerName.toLowerCase());
            if (bar && player.scores.length > 0) {
                const latestScore = player.getLatestScore();
                const height = latestScore.answer.length * 10;
                bar.style.height = `${height}px`;
                
                // Update value label
                const existingLabel = bar.querySelector('.bar-value');
                if (existingLabel) existingLabel.remove();
                
                const valueLabel = document.createElement('div');
                valueLabel.className = 'bar-value';
                valueLabel.textContent = latestScore.answer;
                bar.appendChild(valueLabel);
            }
        };

        // Update all player bars
        updateBar(this.gameSession.human_player);
        this.gameSession.ai_players.forEach(updateBar);
        updateBar(this.gameSession.ante_player);
    }

    handleGameOver() {
        // Calculate final scores and determine winner
        const container = document.getElementById(this.containerId);
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <h3>Game Over!</h3>
            <p>Final Scores:</p>
            <ul>
                ${this.generateFinalScores()}
            </ul>
        `;
        container.appendChild(gameOverDiv);
    }

    generateFinalScores() {
        const allPlayers = [
            this.gameSession.human_player,
            ...this.gameSession.ai_players,
            this.gameSession.ante_player
        ];

        return allPlayers
            .map(player => {
                const totalScore = player.scores
                    .reduce((sum, score) => sum + score.answer.length, 0);
                return `<li>${player.playerName}: ${totalScore}</li>`;
            })
            .join('');
    }
}

module.exports = GameController;