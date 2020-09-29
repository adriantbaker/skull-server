import CardPlayer from './CardPlayer';
// import Player from './Player';

class CoupPlayer extends CardPlayer {
    numCoins: number

    constructor(socketId: string, name: string, isOwner = false) {
        super(socketId, name, isOwner);
        this.numCoins = 2;
    }

    addCoins(numCoins: number): void {
        this.numCoins += numCoins;
    }

    removeCoins(numCoins: number): void {
        this.numCoins = Math.max(this.numCoins - numCoins, 0);
    }

    // getPublic() {
    //     return {
    //         id: this.id,
    //         name: this.name,
    //         numCards: this.cards.length,
    //         numCoins: this.numCoins,
    //     };
    // }
}

export default CoupPlayer;
