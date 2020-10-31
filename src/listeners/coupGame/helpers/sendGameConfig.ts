import { Server, Socket } from 'socket.io';
import CoupGame, { Turn } from '../../../utils/classes/Game/CoupGame/CoupGame';

export interface GameConfig {
    actionTimeLimit: number
    respondTimeLimit: number
    previousTurns: Array<Turn>
}

const getGameConfig = (game: CoupGame): GameConfig => {
    const gameConfig: GameConfig = {
        actionTimeLimit: 45,
        respondTimeLimit: 30,
        previousTurns: game.previousTurns,
    };
    return gameConfig;
};

export const sendGameConfigToAll = (game: CoupGame, io: Server): void => {
    const gameConfig = getGameConfig(game);
    io.to(game.id).emit('gameConfig', gameConfig);
};

export const sendGameConfigToOne = (game: CoupGame, socket: Socket): void => {
    const gameConfig = getGameConfig(game);
    socket.emit('gameConfig', gameConfig);
};
