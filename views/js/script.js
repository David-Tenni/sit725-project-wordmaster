$(document).ready(function(){
  $('.modal').modal();
});
// Initialize materialize components
document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.modal');
  var instances = M.Modal.init(elems);
  
  // Initialize ScoreBoard
  import('/models/ScoreBoard.js') 
    .then(module => {
      const ScoreBoard = module.default;
      return import('/controllers/ScoreBoardController.js') 
        .then(controllerModule => {
          const ScoreBoardController = controllerModule.default;
          const scoreBoard = new ScoreBoard();
          const scoreBoardController = new ScoreBoardController(scoreBoard, 'scoreBoard');
        });
    })
    .catch(error => console.error('Error loading ScoreBoard:', error));
});
