import CoupCard, { CardType } from '../Card/CoupCard';
import Deck from '../Deck/CoupDeck';
import CoupPlayer from '../Player/CoupPlayer';
import CoupPlayers from '../Players/CoupPlayers';

const deckCardTypes = [
    {
        name: CardType.Ambassador,
        count: 3,
    },
    {
        name: CardType.Assassin,
        count: 3,
    },
    {
        name: CardType.Captain,
        count: 3,
    },
    {
        name: CardType.Contessa,
        count: 3,
    },
    {
        name: CardType.Duke,
        count: 3,
    },
];

class CoupGame {
    id: string
    owner: CoupPlayer
    name: string
    players: CoupPlayers
    started: boolean
    currentTurn: number
    deck: Deck

    constructor(name: string, owner: CoupPlayer) {
        this.id = owner.id + name + Date.now();
        this.owner = owner;
        this.name = name;
        // this.players
        this.started = false;
        this.currentTurn = -1;

        // Initialize Coup deck
        const deckCards: Array<CoupCard> = [];
        let numCardsPushed = 0;
        deckCardTypes.forEach((type) => {
            for (let i = 0; i < type.count; i++) {
                deckCards.push(new CoupCard(type.name, numCardsPushed));
                numCardsPushed += 1;
            }
        });

        this.players = new CoupPlayers();
        this.deck = new Deck(deckCards);
    }

    addPlayer(player: CoupPlayer): void {
        this.players.addPlayer(player);
    }

    removePlayer(playerId: string): CoupPlayer {
        return this.players.removePlayer(playerId) as CoupPlayer;
    }

    startGame(): void {
        this.players.assignTurnOrder();

        // Deal 2 Coup cards to each player
        const numPlayers = this.players.getNumPlayers();
        const hands = this.deck.deal(2, numPlayers);
        this.players.dealToAll(hands);
    }

    income(playerId: string): void {
        const player = this.players.getPlayer(playerId);
        player.addCoins(1);
    }

    foreignAid(playerId: string): void {
        const player = this.players.getPlayer(playerId);
        player.addCoins(2);
    }

    coup(playerId: string, targetId: string): void {
        const player = this.players.getPlayer(playerId);
        // const target = this.players.getPlayer(targetId);
        player.removeCoins(7);
        // TODO: prompt target to choose 1 card to remove
    }

    tax(playerId: string): void {
        const player = this.players.getPlayer(playerId);
        player.addCoins(3);
    }

    assassinate(playerId: string, targetId: string): void {
        const player = this.players.getPlayer(playerId);
        // const target = this.players.getPlayer(targetId);
        player.removeCoins(3);
        // TODO: prompt target to choose 1 card to remove
    }

    steal(playerId: string, targetId: string): void {
        const player = this.players.getPlayer(playerId);
        const target = this.players.getPlayer(targetId);
        target.removeCoins(2);
        player.addCoins(2);
        // TODO: account for player having less than 2 coins
    }

    exchange(playerId: string): void {
        const player = this.players.getPlayer(playerId);
        const newCards = this.deck.draw(2);
        player.addCards(newCards);
        // TODO: prompt player to choose which 2 to keep, which 2 to discard
        this.deck.insert(newCards);
    }

    // blockForeignAid() {

    // }

    // blockAssassination() {

    // }

    // blockSteal() {

    // }

    // challenge() {

    // }
}

export default CoupGame;
