class PlayerScore {
    constructor(category, answer = '', time = 0) {
        this.category = category;
        this.answer = answer;
        this.time = time;
    }
}

module.exports = PlayerScore;