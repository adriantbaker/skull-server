import { Server, Socket } from 'socket.io';
import CoupGame from '../../../utils/classes/Game/CoupGame/CoupGame';

export interface GameConfig {
    actionTimeLimit: number
    respondTimeLimit: number
}

const getGameConfig = (game: CoupGame): GameConfig => {
    const gameConfig: GameConfig = {
        actionTimeLimit: 45,
        respondTimeLimit: 30,
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
