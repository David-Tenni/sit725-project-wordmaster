# SIT725-project
## Running the project
To use this project first clone the repository and run the following command:
```bash
npm install
```

Ensure that you have the correct .env file. If you do not, message someone in the team to send it to you.

After this run the following:
```bash
node server.js
```

## File structure
```markdown
├── controllers
│   ├── categoryController.js
│   ├── GameController.js
│   ├── gameDataController.js
│   ├── leaderboardController.js
│   ├── ProfileController.js
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
│   ├── userProfileRouter.js
│   ├── usersRouter.js
│   ├── wordsRouter.js
├── sockets
│   ├── categories.js
│   ├── highScore.js
│   ├── notification.js
│   ├── totalScore.js
│   ├── wins.js
│   ├── wordLength.js
├── test
│   ├── gameData.test.js
│   ├── gameTestData.js
│   ├── testGameSession.js
│   ├── user.test.js
│   ├── word.test.js
├── views
│   ├── img
│   │   ├── logo.png
│   │   ├── new_logo.svg
│   ├── js
│   │   ├── script.js
│   ├── index.html
│   ├── leaderboard.html
│   ├── login.html
│   ├── mainMenu.html
│   ├── Profile.html
│   ├── scoreBoard.css
│   ├── settings.html
│   ├── signup.html
│   ├── userProfile.html
│   ├── wordmaster.css
├── .env
├── .gitignore
├── authenticator.js
├── package-lock.json
├── package.json
├── README.md
├── server.js
```


## Basic explantion of system

### Game Structure:

Players compete by entering words within specific categories (olympic sports, periodic elements, countries, capital cities)
There are multiple players: The player (this could also be a guest who is not logged in), three competitors, and a special "ANTE" player
The game runs in rounds with a 7-second timer per round
Score visualization is done through a bar chart system

Games can be played with any categories or users can choose an area that they wish to play in (e.g. Geography or History)

### Scoring System:

Players score points based on word length, the time taken the give the answer and the rarity of the word.
Previous players have their words and times stored in the database and their score is automatically generated from this data.
There's a crown system showing the current leader

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