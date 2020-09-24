class Player {
    constructor(playerName) {
        this.name = playerName;
        this.cards = [];
    }

    addCards(cards) {
        this.cards.push(...cards)
    }

    removeCards(cardIds) {
        this.cards = this.cards.filter(card => !cardIds.includes(card.id));
    }
}

module.exports = Player;