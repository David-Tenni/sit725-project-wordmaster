(function(window) {
    class GameController {
        constructor(totalRounds = 5) {
            console.log('GameController initializing...');
            this.timeLimit = 7000;
            this.startTime = null;
            this.timerInterval = null;
            this.initialCategoryDisplayed = false;
            this.totalRounds = totalRounds;
            this.gameData = null;
            this.initializeGame();
            this.initializeEventListeners();
        }

        async checkEndpoint(url) {
            try {
                const response = await fetch(url);
                console.log(`Endpoint check (${url}):`, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers),
                    ok: response.ok
                });
            } catch (error) {
                console.error(`Endpoint check failed (${url}):`, error);
            }
        }

        async fetchGameData() {
            try {
                console.log('Starting data fetch...');
                
                const categoriesResponse = await fetch('/api/game/categories/5', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                const categoriesData = await categoriesResponse.json();
                console.log('Categories data:', categoriesData);

                const playersUrl = '/api/game/players/3';
                const playersResponse = await fetch(playersUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!playersResponse.ok) {
                    throw new Error(`Players request failed: ${playersResponse.status}`);
                }

                const playersData = await playersResponse.json();
                this.gameData = {
                    rounds: playersData.data
                };
                
                return true;
            } catch (error) {
                console.error('Fetch error:', error);
                if (window.M && window.M.toast) {
                    window.M.toast({
                        html: `Failed to load game data: ${error.message}`,
                        classes: 'red'
                    });
                }
                return false;
            }
        }

        async initializeGame() {
            console.log('Initializing game...');
            
            const dataFetched = await this.fetchGameData();
            if (!dataFetched) {
                console.error('Failed to initialize game');
                return;
            }
        
            // Create ScoreBoard and initialize with game data
            this.scoreBoard = new window.ScoreBoard();
        
            // Get player names from the first round
            const firstRound = this.gameData.rounds[0];
            const allAiPlayerNames = Object.keys(firstRound.answers);
            
            // Take only the first 3 AI players
            const aiPlayerNames = allAiPlayerNames.slice(0, 3);
            console.log('Selected AI Player Names:', aiPlayerNames);
        
            // Create AI player instances (only 3)
            const aiPlayers = aiPlayerNames.map((name, index) => 
                new window.Player(index + 1, name)
            );
        
            // Filter game data to only include selected players
            this.gameData.rounds = this.gameData.rounds.map(round => ({
                ...round,
                answers: Object.fromEntries(
                    Object.entries(round.answers)
                        .filter(([name]) => aiPlayerNames.includes(name))
                ),
                category: round.category
            }));
        
            const humanPlayer = new window.Player(4, 'Player');
            const antePlayer = new window.Player(5, 'ANTE');
        
            // Initialize game session with exactly 3 AI players
            this.gameSession = new window.GameSession(aiPlayers, humanPlayer, antePlayer, this.totalRounds);
            
            // Initialize ScoreBoard with filtered game data
            this.scoreBoard.initializeAIPlayers(this.gameData);
            
            if (firstRound) {
                this.gameSession.currentCategory = firstRound.category;
                this.scoreBoard.currentCategory = firstRound.category;
                this.dispatchGameStateUpdate();
            }
            
            this.startTimer();
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
            
            const playerScore = new window.PlayerScore(
                this.gameSession.currentCategory,
                word,
                responseTime
            );
            this.gameSession.human_player.addScore(playerScore);
            this.scoreBoard.recordAnswer('player', word, responseTime);

            this.forceAIResponses();

            if (this.gameSession.currentRound >= this.totalRounds-1) {
                this.handleGameOver();
            } else if (this.gameSession.advanceRound()) {
                this.startNewRound();
            }
        }

        forceAIResponses() {
            const currentRound = this.gameSession.currentRound;
            const roundData = this.gameData.rounds[currentRound - 1];
            
            if (!roundData) {
                console.error('No round data found for round:', currentRound);
                return;
            }
    
            this.gameSession.ai_players.forEach(player => {
                if (!player.scores[currentRound - 1]) {
                    const aiResponse = roundData.answers[player.playerName];
                    
                    if (!aiResponse) {
                        console.error('No AI response found for player:', player.playerName);
                        return;
                    }
    
                    console.log('Adding score for AI player:', player.playerName, aiResponse);
    
                    const aiScore = new window.PlayerScore(
                        this.gameSession.currentCategory,
                        aiResponse.word,
                        aiResponse.time
                    );
                    player.addScore(aiScore);
                    this.scoreBoard.recordAIResponse(player.playerName, aiResponse.word, aiResponse.time);
                }
            });
            
            this.dispatchGameStateUpdate();
        }
    
        checkAIResponses(elapsed) {
            if (this.gameSession.isGameOver()) return;
    
            const currentRound = this.gameSession.currentRound;
            if (currentRound > this.totalRounds) {
                this.handleGameOver();
                return;
            }
    
            const roundData = this.gameData.rounds[currentRound - 1];
            
            if (!roundData) {
                console.error('No round data found for round:', currentRound);
                return;
            }
    
            if (!this.initialCategoryDisplayed) {
                this.gameSession.currentCategory = roundData.category;
                this.scoreBoard.currentCategory = roundData.category;
                this.dispatchGameStateUpdate();
                this.initialCategoryDisplayed = true;
            }
    
            let stateUpdated = false;
            this.gameSession.ai_players.forEach(player => {
                const aiResponse = roundData.answers[player.playerName];
                
                if (!aiResponse) {
                    console.error('No AI response found for player:', player.playerName);
                    return;
                }
    
                if (aiResponse.time <= elapsed && 
                    (!player.scores[currentRound - 1] || 
                     player.scores[currentRound - 1].answer === '')) {
                    
                    console.log('AI player responding:', player.playerName, aiResponse);
                    
                    const aiScore = new window.PlayerScore(
                        this.gameSession.currentCategory,
                        aiResponse.word,
                        aiResponse.time
                    );
                    player.addScore(aiScore);
                    this.scoreBoard.recordAIResponse(player.playerName, aiResponse.word, aiResponse.time);
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
            this.handleWordSubmission('');
        }

        startNewRound() {
            clearInterval(this.timerInterval);
            this.initialCategoryDisplayed = false;
            this.scoreBoard.advanceRound();
            this.startTimer();
            this.dispatchGameStateUpdate();
        }

        handleGameOver() {
            console.log('Game over!');
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
            const allPlayers = [
                this.gameSession.human_player,
                ...this.gameSession.ai_players,
                this.gameSession.ante_player
            ];

            const playersWithScores = allPlayers.map(player => ({
                playerName: player.playerName,
                scores: player.scores,
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
            
            document.dispatchEvent(gameStateEvent);
        }
    }

    window.GameController = GameController;
})(window);