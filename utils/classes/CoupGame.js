const CoupCard = require("./CoupCard");
const Deck = require("./Deck");
const CoupPlayer = require("./CoupPlayer");
const Players = require("./Players");

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
        this.players = new Players();

        // Deal 2 Coup cards to each player
        const numPlayers = this.players.length;
        const hands = this.deck.deal(2, numPlayers);
        for (let i = 0; i < numPlayers; i++) {
            const playerName = players[i];
            const player = new CoupPlayer(playerName);
            player.addCards(hands[i]);
            this.players.addPlayer(player);
        }
    }

    income(playerId) {
        const player = this.players.getPlayer(playerId);
        player.addCoins(1);
    }

    foreignAid(playerId) {
        const player = this.players.getPlayer(playerId);
        player.addCoins(2);
    }

    coup(playerId, targetId) {
        const player = this.players.getPlayer(playerId);
        const target = this.players.getPlayer(targetId);
        player.removeCoins(7);
        // TODO: prompt target to choose 1 card to remove
    }

    tax(playerId) {
        const player = this.players.getPlayer(playerId);
        player.addCoins(3);
    }

    assassinate(playerId, targetId) {
        const player = this.players.getPlayer(playerId);
        const target = this.players.getPlayer(targetId);
        player.removeCoins(3);
        // TODO: prompt target to choose 1 card to remove
    }

    steal(playerId, targetId) {
        const player = this.players.getPlayer(playerId);
        const target = this.players.getPlayer(targetId);
        target.removeCoins(2);
        player.addCoins(2);
        // TODO: account for player having less than 2 coins
    }

    exchange(playerId) {
        const player = this.players.getPlayer(playerId);
        const newCards = this.deck.draw(2);
        player.addCards(newCards);
        // TODO: prompt player to choose which 2 to keep, which 2 to discard
        this.deck.insert(newCards);
    }

    blockForeignAid() {

    }

    blockAssassination() {

    }

    blockSteal() {

    }

    challenge() {
        
    }

}

module.exports = CoupGame;