import CoupCard, { CardType } from '../Card/CoupCard';
import { Hand } from '../Deck/CoupDeck';

export interface CoupPlayerPrivate {
    id: string
    name: string
    isOwner: boolean
    turnNumber: number
    cards: Hand
    exchangeCards: Hand
    deadCards: Hand
    numCoins: number
}

export interface CoupPlayerPublic {
    id: string
    name: string
    isOwner: boolean
    turnNumber: number
    numCards: number
    deadCards: Hand
    numCoins: number
}

class CoupPlayer {
    id: string
    name: string
    isOwner: boolean
    turnNumber: number
    cards: Hand
    deadCards: Hand
    exchangeCards: Hand
    numCoins: number

    constructor(name: string, id: string, isOwner = false) {
        this.name = name;
        this.isOwner = isOwner;
        this.id = id;
        this.turnNumber = -1;
        this.numCoins = 2;
        this.cards = [];
        this.deadCards = [];
        this.exchangeCards = [];
    }

    addCards(cards: Hand): void {
        this.cards.push(...cards);
    }

    addExchangeCards(cards: Hand): void {
        this.exchangeCards.push(...cards);
    }

    /**
     *
     * @description Only use this function if you know the card exists in the player's hand
     */
    removeCard(cardId: number): CoupCard {
        return this.removeCards([cardId])[0];
    }

    killCards(cardIds: Array<number>): void {
        const deadCards = this.removeCards(cardIds);
        this.deadCards.push(...deadCards);
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

    removeCoins(numCoins: number): number {
        const numCoinsRemoved = Math.min(numCoins, this.numCoins);
        this.numCoins -= numCoinsRemoved;
        return numCoinsRemoved;
    }

    isEliminated(): boolean {
        return this.cards.length === 0;
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
            deadCards: this.deadCards,
            exchangeCards: this.exchangeCards,
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
            deadCards: this.deadCards,
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
