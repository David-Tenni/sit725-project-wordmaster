(function(window) {
    class PlayerScore {
    constructor(category, answer = '', time = 0) {
        this.category = category;
        this.answer = answer;
        this.time = time;
    }
}
window.PlayerScore = PlayerScore;
})(window);