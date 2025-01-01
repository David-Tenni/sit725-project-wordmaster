(function(window) {
    class GameController {
    constructor() {
        this.timeLimit = 7000;
        this.startTime = null;
        this.timerInterval = null;
        this.initializeGame();
        this.initializeEventListeners();
        this.startTimer(); 
    }
    

    initializeGame() {
        // Create AI players with predefined names
        const aiPlayers = [
            new Player(1, 'James'),
            new Player(2, 'Sofia'),
            new Player(3, 'Lucas')
        ];

        // Create human and ANTE players
        const humanPlayer = new Player(4, 'Player');
        const antePlayer = new Player(5, 'ANTE');

        // Initialize game session
        this.gameSession = new GameSession(aiPlayers, humanPlayer, antePlayer);
        this.dispatchGameStateUpdate();
    }

    initializeEventListeners() {
        document.addEventListener('wordSubmitted', (e) => {
            this.handleWordSubmission(e.detail.word);
        });

        // Handle timer-based AI responses
        document.addEventListener('timerTick', (e) => {
            this.checkAIResponses(e.detail.elapsed);
        });
    }

    handleWordSubmission(word) {
        if (!word || this.gameSession.isGameOver()) return;

        const responseTime = Date.now() - this.startTime;
        
        // Record human player's answer
        const playerScore = new PlayerScore(
            this.gameSession.currentCategory,
            word,
            responseTime
        );
        this.gameSession.human_player.addScore(playerScore);

        // Generate and record AI responses
        this.generateAIResponses();

        // Update ANTE score and advance round
        this.gameSession.advanceRound();

        // Dispatch event for UI update
        this.dispatchGameStateUpdate();
        
        if (!this.gameSession.isGameOver()) {
            this.startNewRound();
        } else {
            this.handleGameOver();
        }
    }

    generateAIResponses() {
        // Get AI responses from test data for current round
        const roundData = window.gameTestData.rounds[this.gameSession.currentRound - 1];
        
        this.gameSession.ai_players.forEach(player => {
            const aiResponse = roundData.answers[player.playerName.toLowerCase()];
            const aiScore = new PlayerScore(
                this.gameSession.currentCategory,
                aiResponse.word,
                aiResponse.time
            );
            player.addScore(aiScore);
        });

        // Calculate and add ANTE score
        const anteScore = this.gameSession.calculateAnteScore();
        this.gameSession.ante_player.addScore(new PlayerScore(
            this.gameSession.currentCategory,
            'A'.repeat(anteScore),
            0
        ));
    }

    checkAIResponses(elapsed) {
        if (this.gameSession.isGameOver()) return;

        const roundData = window.gameTestData.rounds[this.gameSession.currentRound - 1];
        
        this.gameSession.ai_players.forEach(player => {
            const aiResponse = roundData.answers[player.playerName.toLowerCase()];
            if (aiResponse.time <= elapsed && !player.scores[this.gameSession.currentRound - 1]) {
                const aiScore = new PlayerScore(
                    this.gameSession.currentCategory,
                    aiResponse.word,
                    aiResponse.time
                );
                player.addScore(aiScore);
                this.dispatchGameStateUpdate();
            }
        });
    }

    startTimer() {
        this.startTime = Date.now();
        
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            
            document.dispatchEvent(new CustomEvent('timerTick', {
                detail: { elapsed }
            }));
            
            if (elapsed >= this.timeLimit) {
                this.handleTimeout();
            }
        }, 100);
    }

    handleTimeout() {
        clearInterval(this.timerInterval);
        this.handleWordSubmission('a'); // Default minimum answer
    }

    startNewRound() {
        clearInterval(this.timerInterval);
        this.startTimer();
        this.dispatchGameStateUpdate();
    }

    handleGameOver() {
        clearInterval(this.timerInterval);
        const gameOverEvent = new CustomEvent('gameOver', {
            detail: {
                players: [
                    this.gameSession.human_player,
                    ...this.gameSession.ai_players,
                    this.gameSession.ante_player
                ],
                finalScores: this.calculateFinalScores()
            }
        });
        document.dispatchEvent(gameOverEvent);
    }

    calculateFinalScores() {
        const allPlayers = [
            this.gameSession.human_player,
            ...this.gameSession.ai_players,
            this.gameSession.ante_player
        ];

        return allPlayers.map(player => ({
            name: player.playerName,
            score: player.scores.reduce((sum, score) => sum + score.answer.length, 0)
        }));
    }

    dispatchGameStateUpdate() {
        const gameStateEvent = new CustomEvent('gameStateUpdate', {
            detail: {
                currentRound: this.gameSession.currentRound,
                currentCategory: this.gameSession.currentCategory,
                players: [
                    this.gameSession.human_player,
                    ...this.gameSession.ai_players,
                    this.gameSession.ante_player
                ],
                startTime: this.startTime
            }
        });
        document.dispatchEvent(gameStateEvent);
    }
}

window.GameController = GameController;
})(window);