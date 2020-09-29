import { Hand } from '../Deck/Deck';
import Player from './Player';

class CardPlayer extends Player {
    cards: Hand

    constructor(socketId: string, name: string, isOwner = false) {
        super(socketId, name, isOwner);
        this.cards = [];
    }

    addCards(cards: Hand): void {
        this.cards.push(...cards);
    }

    removeCards(cardIds: Array<number>): void {
        this.cards = this.cards.filter((card) => !cardIds.includes(card.id));
    }
}

export default CardPlayer;
