class CoupPlayer {
    constructor(player) {
        this.id = player.id;
        this.socketId = player.socketId;
        this.name = player.name;
        this.cards = [];
        this.numCoins = 2;
    }

    addCards(cards) {
        console.log(this.cards); console.log(cards);
        this.cards.push(...cards)
        console.log(this.cards);
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

    getPublic() {
        return {
            id: this.id,
            name: this.name,
            numCards: this.cards.length,
            numCoins: this.numCoins,
        }
    }
}

module.exports = CoupPlayer;