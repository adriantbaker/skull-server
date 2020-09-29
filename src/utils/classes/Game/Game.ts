import CardPlayer from '../Player/CardPlayer';
import CoupPlayer from '../Player/CoupPlayer';
import Player, { PlayerPublic } from '../Player/Player';
import CardPlayers from '../Players/CardPlayers';
import Players from '../Players/Players';
import CardGame from './CardGame';
import CoupGame from './CoupGame';

export interface GamePublic {
    id: string,
    owner: PlayerPublic,
    name: string,
    started: boolean
    players: Array<PlayerPublic>
}

export type AnyGame = CardGame | CoupGame

type GamePlayerType<GameType extends AnyGame> = (
    GameType extends CoupGame ? CoupPlayer
    : GameType extends CardGame ? CardPlayer
    : Player
);

type GamePlayersType<GameType extends AnyGame> = (
    GameType extends CardGame ? CardPlayers
    : Players<GamePlayerType<GameType>>
)

class Game<GameType extends AnyGame> {
    id: string
    owner: GamePlayerType<GameType>
    name: string
    // players: GamePlayersType<GameType>
    started: boolean
    currentTurn: number

    constructor(name: string, owner: GamePlayerType<GameType>) {
        this.id = owner.id + name + Date.now();
        this.owner = owner;
        this.name = name;
        this.started = false;
        this.currentTurn = -1;
    }

    // addPlayer(player: GamePlayerType<GameType>): void {
    //     this.players.addPlayer(player);
    // }

    // removePlayer(playerId: string): GamePlayerType<GameType> {
    //     return this.players.removePlayer(playerId);
    // }

    // startGame(): void {
    //     this.players.assignTurnOrder();
    //     this.started = true;
    //     this.currentTurn = 0;
    //     this.gameInfo = new CoupGame(this.players);
    // }

    // getPublic(): GamePublic {
    //     return {
    //         id: this.id,
    //         owner: this.owner.getPublic(),
    //         name: this.name,
    //         started: this.started,
    //         players: this.players.getPlayersPublic(),
    //     };
    // }
}

export default Game;
