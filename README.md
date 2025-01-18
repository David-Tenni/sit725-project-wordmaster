# SIT725-project

This is the ReadMe for our SIT725 project in trimester 3 2024.
Mike cloned and pushed.
David cloned and pushed. 10/12/2024
David approve Pull request 18/12/2024
David started new branch 18/12/2024
David started new branch 22/12/2024

This is our filestrucure
SIT725-PROJECT
├── controllers
│   ├── GameController.js
│   ├── gameDataController.js
│   ├── ScoreBoardController.js
│   ├── userController.js
│   ├── wordsController.js
├── models
│   ├── connection.js
│   ├── gameData.js
│   ├── GameSession.js
│   ├── index.js
│   ├── Player.js
│   ├── PlayerScore.js
│   ├── ScoreBoard.js
│   ├── user.js
│   ├── word.js
├── node_modules
├── routers
│   ├── gameDataRouter.js
│   ├── usersRouter.js
│   ├── wordsRouter.js
├── sockets
│   ├── categories.js
│   ├── highScore.js
│   ├── totalScore.js
│   ├── wins.js
│   ├── wordLength.js
├── test
│   ├── gameTestData.js
│   ├── testGameSession.js
│   ├── user.test.js
│   ├── word.test.js
├── views
│   ├── js
│   │   ├── script.js
│   ├── index.html
│   ├── leaderboard.html
│   ├── login.html
│   ├── mainMenu.html
│   ├── scoreBoard.css
│   ├── settings.html
│   ├── signup.html
│   ├── wordmaster.css
├── .gitignore
├── authenticator.js
├── package-lock.json
├── package.json
├── README.md
├── server.js



Basic explantion of system
Game Structure:


Players compete by entering words within specific categories (animals, periodic elements, countries, best picture winning movies)
There are multiple players: Player (human), James, Sofia, Lucas, and a special "ANTE" player
The game runs in rounds with a 7-second timer per round
Score visualization is done through a bar chart system


Scoring System:


Players score points based on word length
AI players (James, Sofia, Lucas) get random growth in their scores using a BASE_GROWTH and GROWTH_VARIATION system
The ANTE player seems to serve as a threshold - players below ANTE can be eliminated
There's a crown system showing the current leader
Players can be eliminated either by being the lowest scorer or by falling below ANTE


Technical Architecture:


Frontend: HTML/CSS with Materialize CSS framework
Backend: Node.js with Express
Database: MongoDB (storing words in different category collections)
Uses MVC (Model-View-Controller) pattern:

Models: ScoreBoard.js, word.js
Controllers: ScoreBoardController.js, wordsController.js
Views: index.html, scoreBoard.css




Key Features:

Real-time score visualization
7-second countdown timer with color warnings
Word validation system
Category rotation between rounds
Multiple elimination mechanisms
Persistent storage of words in MongoDB
Responsive design with Materialize CSS


User Interface:


Score visualization through animated bars
Input field for word submission
Timer bar with color changes (green → orange → red)
Control buttons for reset, adding points, and elimination
Visual feedback for eliminated players
Category and round number display