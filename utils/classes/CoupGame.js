const CoupCard = require("./CoupCard");
const Deck = require("./Deck");
const Player = require("./Player");

const deckCardTypes = [
    {
        name: 'duke',
        count: 3
    },
    {
        name: 'assassin',
        count: 3
    },
    {
        name: 'captain',
        count: 3
    },
    {
        name: 'ambassador',
        count: 3
    },
    {
        name: 'contessa',
        count: 3
    }
];

class CoupGame {
    constructor(players) {
        // Initialize Coup deck
        const deckCards = [];
        deckCardTypes.forEach(type => {
            for (let i = 0; i < type.count; i++) {
                deckCards.push(new CoupCard(type.name))
            }
        })
        this.deck = new Deck(deckCards);

        // Initialize players
        this.players = players.map(player => new Player(player));

        // Deal 2 Coup cards to each player
        const numPlayers = this.players.length;
        const hands = this.deck.deal(2, numPlayers);
        for (let i = 0; i < numPlayers; i++) {
            this.players[i].addCards(hands[i]);
        }
    }
}

module.exports = CoupGame;