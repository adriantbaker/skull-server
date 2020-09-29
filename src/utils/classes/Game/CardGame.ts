import Game from './Game';
import Deck from '../Deck/Deck';
import CardPlayer from '../Player/CardPlayer';

class CardGame extends Game<CardGame> {
    deck: Deck

    constructor(name: string, owner: CardPlayer, deck: Deck) {
        super(name, owner);
        this.deck = deck;
    }
}

export default CardGame;
