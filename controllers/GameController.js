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
        async fetchAndStoreValidWords(categories) {
            console.log('Starting to fetch valid words for categories:', categories);
            try {
                for (const category of categories) {
                    console.log(`Fetching words for category: ${category}`);
                    const response = await fetch(`/api/word/${category}`);
                    
        
                    const data = await response.json();
                    console.log(`Raw API response for ${category}:`, data);
        
                    if (data.data) {
                        // Extract just the word values from the objects
                        const wordList = data.data.map(item => item.word);
                        
                        localStorage.setItem(`validWords_${category}`, JSON.stringify(wordList));
                    }
                }
            } catch (error) {
                console.error('Error fetching valid words:', error);
                M.toast({
                    html: 'Failed to load word lists. Please refresh the page.',
                    classes: 'red',
                    displayLength: 3000
                });
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
        

            // Fetch and store valid words for each category
            const categories = this.gameData.rounds.map(round => round.category);
            
            await this.fetchAndStoreValidWords(categories);

            // Filter game data to only include selected players
            this.gameData.rounds = this.gameData.rounds.map(round => ({
                ...round,
                answers: Object.fromEntries(
                    Object.entries(round.answers)
                        .filter(([name]) => aiPlayerNames.includes(name))
                ),
                category: round.category
            }));
            
            let currentPlayerName = 'Player';
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if(isLoggedIn){
              currentPlayerName = localStorage.getItem('user');
            }
            const humanPlayer = new window.Player(4, currentPlayerName);
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
        
            if (!this.isValidWord(word, this.gameSession.currentCategory)) {
                // Show error using Materialize toast
                M.toast({
                    html: 'Invalid word for this category!',
                    classes: 'red',
                    displayLength: 2000
                });
        
                // Add visual feedback by making input red
                const input = document.getElementById('playerPoints');
                input.classList.add('invalid');
                setTimeout(() => input.classList.remove('invalid'), 1000);
                //stop them getting points for the invalid one
                return;
            }
        
            const responseTime = Date.now() - this.startTime;
        
            // If user is logged in, save to database
            if (localStorage.getItem('isLoggedIn') === 'true') {
                const accessToken = localStorage.getItem('accessToken');
                
                if (accessToken && accessToken !== 'undefined' && accessToken !== 'null') {
                    $.ajax({
                        url: '/api/user/answer',
                        method: 'PATCH',
                        headers: {
                            'Authorization': accessToken,
                            'Content-Type': 'application/json'
                        },
                        data: JSON.stringify({
                            category: this.gameSession.currentCategory,
                            word: word,
                            time: responseTime
                        }),
                        success: function(response) {
                            console.log('Answer saved to database:', response);
                        },
                        error: function(error) {
                            console.error('Error saving answer:', error);
                        }
                    });
                }
            }
        
            // Record the score locally
            const playerScore = new window.PlayerScore(
                this.gameSession.currentCategory,
                word,
                responseTime
            );
            this.gameSession.human_player.addScore(playerScore);
            this.scoreBoard.recordAnswer('player', word, responseTime);
        
            this.forceAIResponses();
        
            if (this.gameSession.currentRound >= this.totalRounds - 1) {
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
        isValidWord(word, category) {
            console.log(`Checking word: "${word}" for category: "${category}"`);
            
            const validWordsJson = localStorage.getItem(`validWords_${category}`);
            if (!validWordsJson) {
                console.error(`No valid words found in localStorage for category: ${category}`);
                console.log('Current localStorage keys:', 
                    Object.keys(localStorage).filter(key => key.startsWith('validWords_'))
                );
                M.toast({
                    html: 'Error: Word list not loaded. Please refresh the page.',
                    classes: 'red',
                    displayLength: 3000
                });
                return false;
            }
            
            try {
                const validWords = JSON.parse(validWordsJson);
                console.log(`Found ${validWords.length} words for category: ${category}`);
                
                // Debug: Print a few words from the list
                console.log('Sample valid words:', validWords.slice(0, 5));
                
                // Convert both input word and valid words to lowercase for comparison
                const normalizedWord = word.toLowerCase().trim();
                const isValid = validWords.some(validWord => 
                    validWord.toLowerCase().trim() === normalizedWord
                );
                
                console.log(`Word "${word}" is ${isValid ? 'valid' : 'invalid'} for category ${category}`);
                return isValid;
            } catch (error) {
                console.error('Error parsing valid words:', error);
                console.log('Raw localStorage content:', validWordsJson);
                return false;
            }
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

            //because of validation need to handle timeouts here now
        handleTimeoutSubmission() {
            const playerScore = new window.PlayerScore(this.gameSession.currentCategory, '', this.timeLimit);
            this.gameSession.human_player.addScore(playerScore);
            this.scoreBoard.recordAnswer('player', '', this.timeLimit);
            
            this.forceAIResponses();
            this.gameSession.currentRound >= this.totalRounds-1 ? this.handleGameOver() : this.gameSession.advanceRound() && this.startNewRound();
        }
        
        handleTimeout() {
            clearInterval(this.timerInterval);
            this.handleTimeoutSubmission();
        }

        startNewRound() {
            clearInterval(this.timerInterval);
            this.initialCategoryDisplayed = false;
            this.scoreBoard.advanceRound();
            this.startTimer();
            this.dispatchGameStateUpdate();
        }

        handleGameOver() {
            console.log("Game over!");
            clearInterval(this.timerInterval);
        
            const finalScores = this.calculateFinalScores();
            this.updateGameStats(finalScores);
        
            const gameOverEvent = new CustomEvent("gameOver", {
                detail: {
                    players: [
                        this.gameSession.human_player,
                        ...this.gameSession.ai_players,
                        this.gameSession.ante_player,
                    ],
                    finalScores: finalScores,
                },
            });
            document.dispatchEvent(gameOverEvent);
        }
        async updateGameStats(finalScores) {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            const accessToken = localStorage.getItem("accessToken");
        
            if (!isLoggedIn || !accessToken) {
                console.log("User not logged in, skipping stats update");
                return;
            }
        
            const playerScore = finalScores.find(
                (s) => s.name === this.gameSession.human_player.playerName
            )?.score ?? 0;
            const otherScores = finalScores
                .filter((s) => s.name !== this.gameSession.human_player.playerName)
                .map((s) => s.score);
            const isWin = playerScore >= Math.max(...otherScores);
        
            try {
                const response = await fetch("/api/user/game", {
                    method: "POST",
                    headers: {
                        'Accept': "application/json",
                        'Content-Type': "application/json",
                        'Authorization': accessToken
                    },
                    body: JSON.stringify({
                        win: isWin,
                        score: playerScore
                    }),
                });
        
                if (!response.ok) {
                    throw new Error(`Failed to update game stats: ${response.status}`);
                }
        
                console.log("Game stats updated successfully");
            } catch (error) {
                console.error("Error updating game stats:", error);
                if (window.M && window.M.toast) {
                    M.toast({
                        html: "Failed to update game statistics",
                        classes: "red",
                        displayLength: 3000,
                    });
                }
            }
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