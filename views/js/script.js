document.addEventListener('DOMContentLoaded', function() {
  // Set number of rounds for testing
  const totalRounds = 5;
  
  // Initialize modal
  var elems = document.querySelectorAll('.modal');
  var instances = M.Modal.init(elems);
  
  // Initialize ScoreBoard and Controllers
  try {
      
      // Initialize game controller with totalRounds
      const gameController = new window.GameController(totalRounds);
      
      // Initialize ScoreBoardController with totalRounds
      const scoreBoardController = new window.ScoreBoardController('scoreBoard', totalRounds);
      
  } catch (error) {
      console.error('Error initializing game components:', error);
  }
});