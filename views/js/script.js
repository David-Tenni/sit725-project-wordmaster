document.addEventListener('DOMContentLoaded', function() {
  // Set number of rounds for testing
  const totalRounds = 5;
  
  // Initialize modal
  var elems = document.querySelectorAll('.modal');
  var instances = M.Modal.init(elems);
  
  // Initialize ScoreBoard and Controllers
  try {
      console.log('Initializing game components...');
      
      // Initialize game controller with totalRounds
      const gameController = new window.GameController(totalRounds);
      console.log('GameController initialized with', totalRounds, 'rounds');
      
      // Initialize ScoreBoardController with totalRounds
      const scoreBoardController = new window.ScoreBoardController('scoreBoard', totalRounds);
      console.log('ScoreBoardController initialized');
      
  } catch (error) {
      console.error('Error initializing game components:', error);
  }
});