const shuffleCards = require("../helpers/shuffle");

class Deck {
    constructor(unshuffledCards) {
        const cards = unshuffledCards.map((card, i) => ({
            ...card,
            id: i
        }));
        shuffleCards(cards);
        this.cardsInDeck = cards;
        this.cardsInDiscard = [];
    }

    draw(numCards = 1) {
        const numCardsToDraw = numCards;
        const numCardsInDeck = this.cardsInDeck.length;
        if (numCardsInDeck >= numCardsToDraw) {
            return this.cardsInDeck.splice(0, numCardsToDraw);
        }
        // Else, the deck will need to be replenished

        // Take all remaining cards in deck
        const drawnCards = this.cardsInDeck.splice(0, numCardsInDeck);
        // Return discard to the deck
        this.cardsInDeck = this.cardsInDiscard;
        this.cardsInDiscard = [];
        shuffleCards(this.cardsInDeck);
        // Draw remaining number of cards
        const numCardsLeftToDraw = numCardsLeftToDraw - numCardsInDeck;
        drawnCards.push(this.cardsInDeck.splice(0, numCardsLeftToDraw));
        return drawnCards;
    }

    discard(cards) {
        this.cardsInDiscard.push(...cards);
    }

    insert(cards, shuffle = true) {
        this.cardsInDeck.push(...cards);
        if (shuffle) {
            shuffleCards(this.cardsInDeck);
        }
    }

    deal(numCards, numPlayers) {
        const hands = [];
        // Draw 1 card per player at a time
        for (let i = 0; i < numCards; i++) {
            for (let j = 0; j < numPlayers; j++) {
                if (i === 0) {
                    // Initialize player's hand
                    hands[j] = [];
                }
                // Add card to player's hand
                hands[j].push(this.draw(1));
            }
        }
        return hands;
    }
}

module.exports = Deck;