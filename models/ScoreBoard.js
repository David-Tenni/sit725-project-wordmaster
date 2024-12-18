class ScoreBoard {
  constructor() {
    this.BASE_GROWTH = 4.7;
    this.GROWTH_VARIATION = 0.25;
    this.players = ['player', 'james', 'sofia', 'lucas', 'ante'];
    this.scores = new Map();
    this.eliminated = new Set();
    this.categories = ['animals', 'periodic elements', 'countries', 'best picture winning movies'];
    this.currentRound = 1;
    this.currentCategory = this.getRandomCategory();
    this.resetScores();
    
    console.log('Initialized players:', this.players);
  }
  
  getRandomCategory() {
    return this.categories[Math.floor(Math.random() * this.categories.length)];
  }
  
  resetScores() {
    this.scores.clear();
    this.players.forEach(player => {
      this.scores.set(player, 0);
    });
    this.eliminated.clear();
    this.currentRound = 1; 
    
    console.log('Reset scores:', Array.from(this.scores.entries()));
  }
  
    growScores() {
      this.players.forEach(player => {
        if (!this.eliminated.has(player)) {
          const currentValue = this.scores.get(player);
          const growthRange = this.BASE_GROWTH * this.GROWTH_VARIATION * 2;
          const randomGrowth = (this.BASE_GROWTH * (1 - this.GROWTH_VARIATION)) + 
                             (Math.random() * growthRange);
          this.scores.set(player, currentValue + randomGrowth);
        }
      });
    }
  
    getHighestPlayer() {
      let highestValue = -Infinity;
      let highestPlayer = null;
  
      this.players.forEach(player => {
        if (player !== 'ante' && !this.eliminated.has(player)) {
          const value = this.scores.get(player);
          if (value > highestValue) {
            highestValue = value;
            highestPlayer = player;
          }
        }
      });
  
      return highestPlayer;
    }
  
    eliminateLowest() {
      let lowestValue = Infinity;
      let lowestPlayer = null;
  
      this.players.forEach(player => {
        if (player !== 'ante' && !this.eliminated.has(player)) {
          const value = this.scores.get(player);
          if (value < lowestValue) {
            lowestValue = value;
            lowestPlayer = player;
          }
        }
      });
  
      if (lowestPlayer) {
        this.eliminated.add(lowestPlayer);
      }
      return lowestPlayer;
    }
  
    eliminateBelowAnte() {
      const anteValue = this.scores.get('ante');
      const eliminated = [];
  
      this.players.forEach(player => {
        if (player !== 'ante' && !this.eliminated.has(player)) {
          const value = this.scores.get(player);
          if (value < anteValue) {
            this.eliminated.add(player);
            eliminated.push(player);
          }
        }
      });
  
      return eliminated;
    }
  
    getScore(player) {
      return this.scores.get(player);
    }
  
    isEliminated(player) {
      return this.eliminated.has(player);
    }
  }
  
  export default ScoreBoard;