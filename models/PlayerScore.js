(function(window) {
    class PlayerScore {
        constructor(category, answer = '', time = 0, score = 0) {
            this.category = category;
            this.answer = answer;
            this.time = time;
            this.score = score;
        }
    }
    window.PlayerScore = PlayerScore;
})(window);