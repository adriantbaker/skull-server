import { Hands } from '../Deck/Deck';
import CardPlayer from '../Player/CardPlayer';
import Players from './Players';

class CardPlayers extends Players<CardPlayer> {
    dealToAll(hands: Hands): void {
        if (this.turnOrder.length === 0) {
            this.assignTurnOrder();
        }
        this.turnOrder.forEach((playerId, i) => {
            const player = this.getPlayer(playerId);
            player.addCards(hands[i]);
        });
    }
}

export default CardPlayers;
