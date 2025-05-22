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

You can also run this project in docker using the following commands:

To build the image:
```bash
docker build -t word-master .
```

To run the image:
```bash
docker run -p 3000:3000 word-master
```

## File structure
```markdown
├── controllers
│   ├── categorySelectionController.js
│   ├── categoryController.js
│   ├── GameController.js
│   ├── gameDataController.js
│   ├── leaderboardController.js
│   ├── notificationController.js
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
│   ├── categoriesTests.js
│   ├── dbMock.js
│   ├── gameDataRoutesTests.js
│   ├── gameDataTests.js
│   ├── gameTestData.js
│   ├── highScoreTests.js
│   ├── integration.js
│   ├── testGameSession.js
│   ├── tests.test.js
│   ├── totalScoreTests.js
│   ├── unitTests.js
│   ├── userRoutesTests.js
│   ├── userTests.js
│   ├── winsTests.js
│   ├── wordLengthTests.js
│   ├── wordRoutesTests.js
│   ├── wordTests.js
├── views
│   ├── img
│   │   ├── logo.ico
│   │   ├── new_logo.svg
│   ├── js
│   │   ├── script.js
│   ├── index.html
│   ├── instructions.html
│   ├── leaderboard.html
│   ├── login.html
│   ├── mainMenu.html
│   ├── navbar.html
│   ├── Profile.html
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
├── requestWithRefresh.js
├── server.js
├── Dockerfile
├── .dockerignore
```
start

## Basic explantion of system

### Game Structure:

Players compete by entering words within specific categories (olympic sports, periodic elements, countries, capital cities)
There are multiple players: The player (this could also be a guest who is not logged in) and three competitors.
The game runs in rounds with a 7-second timer per round.
Score visualization is done through a bar chart system.

Games can be played with any categories or users can choose an area that they wish to play in (e.g. Geography or History).

### Scoring System:

Players score points based on word length, the time taken the give the answer and the rarity of the word.
Previous players have their words and times stored in the database and their score is automatically generated from this data.
There's a crown system showing the current leader.

### Technical Architecture:

- Frontend: HTML/CSS with Materialize CSS framework
- Backend: Node.js with Express, socket.io, bcrypt, mongodb and jsonwebtoken
- Database: MongoDB (storing words in different category collections)
- Uses MVC (Model-View-Controller) pattern:

- Models: Used as for object that are retrieved from the database of used in the code
- Controllers: Used to provide responses to api requests or to control frontend files
- Views: The pages that the user will see

### Key Features:

- Real-time score visualization
- Notifications when high score is exceeded
- 7-second countdown timer with color warnings
- Word validation system
- Category rotation between rounds
- Multiple elimination mechanisms
- Persistent storage of words in MongoDB
- Responsive design with Materialize CSS

### User Interface:

- Score visualization through animated bars
- Input field for word submission
- Timer bar with color changes (green → orange → red)
- Control buttons for reset, adding points, and elimination
- Visual feedback for eliminated players
- Category and round number display