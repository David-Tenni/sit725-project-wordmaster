const GameSession = require('../models/GameSession');
const Player = require('../models/Player');
const PlayerScore = require('../models/PlayerScore');

// Create test data
function createTestGameSession() {
    // Create AI players
    const james = new Player(1, 'James');
    const sofia = new Player(2, 'Sofia');
    const lucas = new Player(3, 'Lucas');
    
    // Create human player
    const humanPlayer = new Player(4, 'Player');
    
    // Create ANTE player
    const antePlayer = new Player(5, 'ANTE');

    // Initialize game session
    const gameSession = new GameSession([james, sofia, lucas], humanPlayer, antePlayer);

    // Simulate 3 rounds of gameplay
    const testRounds = [
        {
            category: 'animals',
            answers: {
                james: { word: 'elephant', time: 3500 },
                sofia: { word: 'giraffe', time: 4200 },
                lucas: { word: 'penguin', time: 2800 },
                player: { word: 'cat', time: 5000 }
            }
        },
        {
            category: 'countries',
            answers: {
                james: { word: 'france', time: 2900 },
                sofia: { word: 'brazil', time: 3700 },
                lucas: { word: 'japan', time: 4500 },
                player: { word: 'spain', time: 3200 }
            }
        },
        {
            category: 'periodic elements',
            answers: {
                james: { word: 'hydrogen', time: 3100 },
                sofia: { word: 'helium', time: 2500 },
                lucas: { word: 'lithium', time: 4700 },
                player: { word: 'carbon', time: 3800 }
            }
        }
    ];

    // Add scores for each round
    testRounds.forEach(round => {
        // Add AI player scores
        james.addScore(new PlayerScore(round.category, round.answers.james.word, round.answers.james.time));
        sofia.addScore(new PlayerScore(round.category, round.answers.sofia.word, round.answers.sofia.time));
        lucas.addScore(new PlayerScore(round.category, round.answers.lucas.word, round.answers.lucas.time));
        
        // Add human player score
        humanPlayer.addScore(new PlayerScore(round.category, round.answers.player.word, round.answers.player.time));
        
        // Calculate and add ANTE score
        const anteScore = gameSession.calculateAnteScore();
        antePlayer.addScore(new PlayerScore(round.category, 'A'.repeat(anteScore), 0));
        
        // Advance to next round if not the last round
        if (gameSession.currentRound < 3) {
            gameSession.advanceRound();
        }
    });

    return gameSession;
}

// Test the game session
function testGameSession() {
    const gameSession = createTestGameSession();
    
    console.log('\n=== Game Session Test Results ===\n');
    
    // Test game session properties
    console.log('Current Round:', gameSession.currentRound);
    console.log('Current Category:', gameSession.currentCategory);
    console.log('\nPlayers in game:', 
        [
            gameSession.human_player.playerName,
            ...gameSession.ai_players.map(p => p.playerName),
            gameSession.ante_player.playerName
        ]
    );

    // Test score history
    console.log('\nScore History:');
    const rounds = Math.min(...[
        gameSession.human_player.scores.length,
        ...gameSession.ai_players.map(p => p.scores.length),
        gameSession.ante_player.scores.length
    ]);

    for (let i = 0; i < rounds; i++) {
        console.log(`\nRound ${i + 1} - Category: ${gameSession.human_player.scores[i].category}`);
        console.log('Player:', gameSession.human_player.scores[i].answer, 
            `(${gameSession.human_player.scores[i].time}ms)`);
        gameSession.ai_players.forEach(player => {
            console.log(`${player.playerName}:`, player.scores[i].answer, 
                `(${player.scores[i].time}ms)`);
        });
        console.log('ANTE:', gameSession.ante_player.scores[i].answer);
    }
}

// Run the test
testGameSession();

module.exports = { createTestGameSession, testGameSession };