import { Server, Socket } from 'socket.io';
import CoupGame, { Turn } from '../../../utils/classes/Game/CoupGame/CoupGame';
import { Action } from '../../../utils/classes/Game/CoupGame/initializers/initializeAction';

export interface GameUpdate {
    currentTurn: Turn,
    currentAction: Action | undefined,
    currentBlock: Action | undefined
}

const getGameUpdate = (game: CoupGame): GameUpdate => {
    const gameUpdate: GameUpdate = {
        currentTurn: game.currentTurn,
        currentAction: game.currentAction,
        currentBlock: game.currentBlock,
    };
    return gameUpdate;
};

export const sendGameUpdateToAll = (game: CoupGame, io: Server): void => {
    const gameUpdate = getGameUpdate(game);
    io.to(game.id).emit('gameUpdate', gameUpdate);
};

export const sendGameUpdateToOne = (game: CoupGame, socket: Socket): void => {
    const gameUpdate = getGameUpdate(game);
    socket.emit('gameUpdate', gameUpdate);
};
