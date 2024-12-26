document.addEventListener('DOMContentLoaded', function() {
  // Initialize modal
  var elems = document.querySelectorAll('.modal');
  var instances = M.Modal.init(elems);
  
  // Initialize ScoreBoard
  try {
    console.log('Initializing ScoreBoard...');
    const scoreBoard = new window.ScoreBoard();
    console.log('ScoreBoard initialized:', scoreBoard);
    
    console.log('Initializing ScoreBoardController...');
    const scoreBoardController = new window.ScoreBoardController(scoreBoard, 'scoreBoard');
    console.log('ScoreBoardController initialized');
  } catch (error) {
    console.error('Error initializing scoreboard:', error);
  }
});