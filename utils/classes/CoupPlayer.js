class CoupPlayer {
    constructor(playerName) {
        this.id = playerName + Date.now();
        this.name = playerName;
        this.cards = [];
        this.numCoins = 2;
    }

    addCards(cards) {
        this.cards.push(...cards)
    }

    removeCards(cardIds) {
        this.cards = this.cards.filter(card => !cardIds.includes(card.id));
    }

    addCoins(numCoins) {
        this.numCoins += numCoins;
    }

    removeCoins(numCoins) {
        this.numCoins = Math.max(this.numCoins - numCoins, 0);
    }
}

module.exports = CoupPlayer;