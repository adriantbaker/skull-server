import CoupCard, { CardType } from '../Card/CoupCard';
import { Hand } from '../Deck/CoupDeck';

export interface CoupPlayerPrivate {
    id: string
    name: string
    isOwner: boolean
    turnNumber: number
    cards: Hand
    numCoins: number
}

export interface CoupPlayerPublic {
    id: string
    name: string
    isOwner: boolean
    turnNumber: number
    numCards: number
    numCoins: number
}

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

    /**
     *
     * @param cardId ID of card to be removed
     *
     * @description Only use this function if you know the card exists in the player's hand
     */
    removeCard(cardId: number): CoupCard {
        return this.removeCards([cardId])[0];
    }

    removeCards(cardIds: Array<number>): Array<CoupCard> {
        const remainingCards: CoupCard[] = [];
        const removedCards: CoupCard[] = [];
        this.cards.forEach((card) => {
            if (cardIds.includes(card.id)) {
                removedCards.push(card);
            } else {
                remainingCards.push(card);
            }
        });
        this.cards = remainingCards;
        return removedCards;
    }

    addCoins(numCoins: number): void {
        this.numCoins += numCoins;
    }

    removeCoins(numCoins: number): void {
        this.numCoins = Math.max(this.numCoins - numCoins, 0);
    }

    /** Getters */

    /**
     * @description Get information a player can know about oneself
     */
    getPrivate(): CoupPlayerPrivate {
        return {
            id: this.id,
            name: this.name,
            isOwner: this.isOwner,
            turnNumber: this.turnNumber,
            cards: this.cards,
            numCoins: this.numCoins,
        };
    }

    /**
     * @description Get information a player can know about one's opponent
     */
    getPublic(): CoupPlayerPublic {
        return {
            id: this.id,
            name: this.name,
            isOwner: this.isOwner,
            turnNumber: this.turnNumber,
            numCards: this.cards.length,
            numCoins: this.numCoins,
        };
    }

    searchForCardOfType(cardType: CardType): CoupCard | undefined {
        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            if (card.type === cardType) {
                return card;
            }
        }
        return undefined;
    }
}

export default CoupPlayer;
