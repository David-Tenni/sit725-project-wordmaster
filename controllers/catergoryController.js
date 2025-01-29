document.addEventListener("DOMContentLoaded", () => {
  const selectedCategory = localStorage.getItem("selectedCategory");

  // console.log('Initializing game with category:', selectedCategory || 'Random');
  const totalRounds = 5;
  try {
    //pass category
    const gameController = new window.GameController(
      totalRounds,
      selectedCategory
    );
    const scoreBoardController = new window.ScoreBoardController(
      "scoreBoard",
      totalRounds
    );
  } catch (error) {
    console.error("Error initializing game components:", error);
  }
});
