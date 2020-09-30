import { Hand } from '../Deck/CoupDeck';

class CoupPlayer {
    id: string
    socketId: string
    name: string
    isOwner: boolean
    turnNumber: number
    cards: Hand
    numCoins: number

    constructor(socketId: string, name: string, isOwner = false) {
        this.socketId = socketId;
        this.name = name;
        this.isOwner = isOwner;
        this.id = name + Date.now();
        this.turnNumber = -1;
        this.numCoins = 2;
        this.cards = [];
    }

    addCards(cards: Hand): void {
        this.cards.push(...cards);
    }

    removeCards(cardIds: Array<number>): void {
        this.cards = this.cards.filter((card) => !cardIds.includes(card.id));
    }

    addCoins(numCoins: number): void {
        this.numCoins += numCoins;
    }

    removeCoins(numCoins: number): void {
        this.numCoins = Math.max(this.numCoins - numCoins, 0);
    }
}

export default CoupPlayer;
