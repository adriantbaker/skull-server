import CardGame from '../Game/CardGame';
import CoupGame from '../Game/CoupGame';
import Game, { AnyGame } from '../Game/Game';
import CoupPlayer from '../Player/CoupPlayer';

class Games<GameType extends AnyGame> {
    games: { [key: string]: Game<GameType> }

    constructor() {
        this.games = {};
    }

    addGame(game: Game<GameType>): void {
        this.games[game.id] = game;
    }

    removeGame(gameId: string): Game<GameType> {
        const game = this.games[gameId];
        delete this.games[gameId];
        return game;
    }

    getGame(gameId: string): Game<GameType> {
        return this.games[gameId];
    }

    // getGamePublic(gameId: string): GamePublic {
    //     return this.games[gameId].getPublic();
    // }

    getGames(): Array<Game<GameType>> {
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

export default Games;
