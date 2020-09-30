import CoupGame, { CoupGamePublic } from './CoupGame';

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

    /** Getters */

    getOne(gameId: string): CoupGame {
        return this.games[gameId];
    }

    getOnePublic(gameId: string): CoupGamePublic {
        return this.games[gameId].getPublic();
    }

    getAll(): Array<CoupGame> {
        return Object.values(this.games);
    }

    getAllPublic(): Array<CoupGamePublic> {
        return Object.values(this.games).map((game) => game.getPublic());
    }

    getNumGames(): number {
        return Object.keys(this.games).length;
    }
}

export default CoupGames;
