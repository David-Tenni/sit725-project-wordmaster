(function(window) {
    class GameController {
        constructor() {
            console.log('GameController initializing...');
            this.timeLimit = 7000;
            this.startTime = null;
            this.timerInterval = null;
            this.initialCategoryDisplayed = false;
            this.initializeGame();
            this.dispatchGameStateUpdate();
            this.initializeEventListeners();
            this.startTimer();
        }

        initializeGame() {
            console.log('Initializing game...');
            // Create AI players with predefined names
            const aiPlayers = [
                new window.Player(1, 'James'),
                new window.Player(2, 'Sofia'), 
                new window.Player(3, 'Lucas')
            ];

            // Create human and ANTE players
            const humanPlayer = new window.Player(4, 'Player');
            const antePlayer = new window.Player(5, 'ANTE');

            // Initialize game session
            this.gameSession = new window.GameSession(aiPlayers, humanPlayer, antePlayer);
            
            // Force initial category
            const firstRoundData = window.gameTestData.rounds[0];
            if (firstRoundData) {
                this.gameSession.currentCategory = firstRoundData.category;
                this.dispatchGameStateUpdate();
            }
            
            console.log('Game session initialized with category:', this.gameSession.currentCategory);
        }

        initializeEventListeners() {
            document.addEventListener('wordSubmitted', (e) => {
                this.handleWordSubmission(e.detail.word);
            });

            document.addEventListener('timerTick', (e) => {
                this.checkAIResponses(e.detail.elapsed);
            });
        }

        handleWordSubmission(word) {
            if (!word || this.gameSession.isGameOver()) return;

            const responseTime = Date.now() - this.startTime;
            
            // Record human player's answer
            const playerScore = new window.PlayerScore(
                this.gameSession.currentCategory,
                word,
                responseTime
            );
            this.gameSession.human_player.addScore(playerScore);

            // Generate and record AI responses
            this.generateAIResponses();

            // Dispatch event for UI update before advancing round
            this.dispatchGameStateUpdate();
            
            // Update ANTE score and advance round
            this.gameSession.advanceRound();
            
            if (!this.gameSession.isGameOver()) {
                this.startNewRound();
            } else {
                this.handleGameOver();
            }
        }

        generateAIResponses() {
            // Get AI responses from test data for current round
            const roundData = window.gameTestData.rounds[this.gameSession.currentRound - 1];
            
            if (roundData.category !== this.gameSession.currentCategory) {
                console.warn('Category mismatch detected, syncing with test data');
                this.gameSession.currentCategory = roundData.category;
            }
            
            this.gameSession.ai_players.forEach(player => {
                const aiResponse = roundData.answers[player.playerName.toLowerCase()];
                const aiScore = new window.PlayerScore(
                    this.gameSession.currentCategory,
                    aiResponse.word,
                    aiResponse.time
                );
                player.addScore(aiScore);
            });

            // Calculate and add ANTE score
            const anteScore = this.gameSession.calculateAnteScore();
            this.gameSession.ante_player.addScore(new window.PlayerScore(
                this.gameSession.currentCategory,
                'A'.repeat(anteScore),
                0
            ));
        }

        checkAIResponses(elapsed) {
            if (this.gameSession.isGameOver()) return;

            const roundData = window.gameTestData.rounds[this.gameSession.currentRound - 1];
            
            if (!this.initialCategoryDisplayed) {
                this.gameSession.currentCategory = roundData.category;
                this.dispatchGameStateUpdate();
                this.initialCategoryDisplayed = true;
            }

            let stateUpdated = false;
            this.gameSession.ai_players.forEach(player => {
                const aiResponse = roundData.answers[player.playerName.toLowerCase()];
                if (aiResponse.time <= elapsed && !player.scores[this.gameSession.currentRound - 1]) {
                    const aiScore = new window.PlayerScore(
                        this.gameSession.currentCategory,
                        aiResponse.word,
                        aiResponse.time
                    );
                    player.addScore(aiScore);
                    stateUpdated = true;
                }
            });

            if (stateUpdated) {
                this.dispatchGameStateUpdate();
            }
        }

        startTimer() {
            this.dispatchGameStateUpdate();
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
                score: player.scores.reduce((sum, score) => sum + score.answer.length, 0),
                scores: player.scores 
            }));
        }

        dispatchGameStateUpdate() {
            console.log('Dispatching game state update...');
            
            const allPlayers = [
                this.gameSession.human_player,
                ...this.gameSession.ai_players,
                this.gameSession.ante_player
            ];

            const playersWithScores = allPlayers.map(player => ({
                ...player,
                totalScore: player.scores.reduce((sum, score) => sum + score.answer.length, 0)
            }));

            const gameStateEvent = new CustomEvent('gameStateUpdate', {
                detail: {
                    currentRound: this.gameSession.currentRound,
                    currentCategory: this.gameSession.currentCategory,
                    players: playersWithScores,
                    startTime: this.startTime
                }
            });
            
            console.log('Dispatching event with details:', gameStateEvent.detail);
            document.dispatchEvent(gameStateEvent);
        }
    }

    window.GameController = GameController;
})(window);