(function(window) {
    class GameController {
        constructor(totalRounds = 5) {
            console.log('GameController initializing...');
            this.timeLimit = 7000;
            this.startTime = null;
            this.timerInterval = null;
            this.initialCategoryDisplayed = false;
            this.totalRounds = totalRounds; 
            this.initializeGame();
            this.dispatchGameStateUpdate();
            this.initializeEventListeners();
            this.startTimer();
        }

        initializeGame() {
            console.log('Initializing game...');
            const aiPlayers = [
                new window.Player(1, 'James'),
                new window.Player(2, 'Sofia'), 
                new window.Player(3, 'Lucas')
            ];

            const humanPlayer = new window.Player(4, 'Player');
            const antePlayer = new window.Player(5, 'ANTE');

            // Pass totalRounds to GameSession
            this.gameSession = new window.GameSession(aiPlayers, humanPlayer, antePlayer, this.totalRounds);
            
            // Reset for first round
            this.initialCategoryDisplayed = false;
            
            // Force initial category from test data
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
            
            // Add human player's score
            const playerScore = new window.PlayerScore(
                this.gameSession.currentCategory,
                word,
                responseTime
            );
            this.gameSession.human_player.addScore(playerScore);

            // Force AI responses for current round
            this.forceAIResponses();

            // Calculate and add ANTE score
            const anteScore = this.gameSession.calculateAnteScore();
            this.gameSession.ante_player.addScore(new window.PlayerScore(
                this.gameSession.currentCategory,
                'A'.repeat(anteScore),
                0
            ));

            this.dispatchGameStateUpdate();
            
            // Check if we've reached the total rounds
            if (this.gameSession.currentRound >= this.totalRounds) {
                this.handleGameOver();
            } else if (this.gameSession.advanceRound()) {
                this.startNewRound();
            }
        }

        forceAIResponses() {
            const currentRound = this.gameSession.currentRound;
            const roundData = window.gameTestData.rounds[currentRound - 1];
            
            if (!roundData) {
                console.error('No round data found for round:', currentRound);
                return;
            }

            // Force all AI players to respond if they haven't yet
            this.gameSession.ai_players.forEach(player => {
                if (!player.scores[currentRound - 1]) {
                    const aiResponse = roundData.answers[player.playerName.toLowerCase()];
                    if (!aiResponse) {
                        console.error('No AI response found for player:', player.playerName);
                        return;
                    }

                    const aiScore = new window.PlayerScore(
                        this.gameSession.currentCategory,
                        aiResponse.word,
                        aiResponse.time
                    );
                    player.addScore(aiScore);
                }
            });
        }

        checkAIResponses(elapsed) {
            if (this.gameSession.isGameOver()) return;

            const currentRound = this.gameSession.currentRound;
            if (currentRound > this.totalRounds) {
                this.handleGameOver();
                return;
            }

            const roundData = window.gameTestData.rounds[currentRound - 1];
            
            if (!roundData) {
                console.error('No round data found for round:', currentRound);
                return;
            }

            // Set initial category for new round
            if (!this.initialCategoryDisplayed) {
                this.gameSession.currentCategory = roundData.category;
                this.dispatchGameStateUpdate();
                this.initialCategoryDisplayed = true;
            }

            let stateUpdated = false;
            this.gameSession.ai_players.forEach(player => {
                const aiResponse = roundData.answers[player.playerName.toLowerCase()];
                if (!aiResponse) {
                    console.error('No AI response found for player:', player.playerName);
                    return;
                }

                // Check if AI should respond based on elapsed time and hasn't responded yet
                if (aiResponse.time <= elapsed && 
                    (!player.scores[currentRound - 1] || 
                     player.scores[currentRound - 1].answer === '')) {
                    
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
            this.startTime = Date.now();
            this.initialCategoryDisplayed = false;
            
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
            this.handleWordSubmission('a');
        }

        startNewRound() {
            clearInterval(this.timerInterval);
            this.initialCategoryDisplayed = false; 
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