import CoupGame from '../Game/CoupGame';

class CoupGames {
    games: { [key: string]: CoupGame }

    constructor() {
        this.games = {};
    }

    addGame(game: CoupGame): void {
        this.games[game.id] = game;
    }

    removeGame(gameId: string): CoupGame {
        const game = this.games[gameId];
        delete this.games[gameId];
        return game;
    }

    getGame(gameId: string): CoupGame {
        return this.games[gameId];
    }

    // getGamePublic(gameId: string): GamePublic {
    //     return this.games[gameId].getPublic();
    // }

    getGames(): Array<CoupGame> {
        return Object.values(this.games);
    }

    // getGamesPublic() {
    //     console.log('HI');
    //     return Object.values(this.games)
    //         .map((game) => game.getPublic());
    // }

    getNumGames(): number {
        return Object.keys(this.games).length;
    }
}

export default CoupGames;
