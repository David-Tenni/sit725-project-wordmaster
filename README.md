# SIT725-project
## Running the project
To use this project first clone the repository and run the following commands:
```bash
npm install
```
After this run the following:
```bash
node server.js
```

## File structure
```markdown
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
```


## Basic explantion of system

### Purpose of the Game:
### Game Structure:

Players compete by entering words within specific categories (olympic sports, periodic elements, countries, capital cities)
There are multiple players: The player (this could also be a guest who is not logged in), three competitors, and a special "ANTE" player
The game runs in rounds with a 7-second timer per round
Score visualization is done through a bar chart system

### Scoring System:

Players score points based on word length
Previous players have their words and times stored in the database and their score is automatically generated from this data
The ANTE player seems to serve as a threshold - players below ANTE can be eliminated
There's a crown system showing the current leader
Players can be eliminated either by being the lowest scorer or by falling below ANTE

### Technical Architecture:

Frontend: HTML/CSS with Materialize CSS framework
Backend: Node.js with Express, socket.io, bcrypt, mongodb and jsonwebtoken
Database: MongoDB (storing words in different category collections)
Uses MVC (Model-View-Controller) pattern:

Models: Used as for object that are retrieved from the database of used in the code
Controllers: Used to provide responses to api requests or to control frontend files
Views: The pages that the user will see

### Key Features:

Real-time score visualization
Notifications when high score is exceeded
7-second countdown timer with color warnings
Word validation system
Category rotation between rounds
Multiple elimination mechanisms
Persistent storage of words in MongoDB
Responsive design with Materialize CSS

### User Interface:

Score visualization through animated bars
Input field for word submission
Timer bar with color changes (green → orange → red)
Control buttons for reset, adding points, and elimination
Visual feedback for eliminated players
Category and round number display