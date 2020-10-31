import { Server, Socket } from 'socket.io';
import CoupGame, { Turn } from '../../../utils/classes/Game/CoupGame/CoupGame';

export interface GameUpdate {
    currentTurn: Turn,
    won: boolean
    winnerId: string
    winnerName: string
    previousTurn: Turn | undefined
}

const getGameUpdate = (game: CoupGame, includeLastTurn: boolean): GameUpdate => {
    const gameUpdate: GameUpdate = {
        currentTurn: game.currentTurn,
        won: game.won,
        winnerId: game.winnerId,
        winnerName: game.winnerName,
        previousTurn: includeLastTurn ? game.previousTurns[0] : undefined,
    };
    return gameUpdate;
};

export const sendGameUpdateToAll = (
    game: CoupGame,
    io: Server,
    includeLastTurn = false,
): void => {
    const gameUpdate = getGameUpdate(game, includeLastTurn);
    io.to(game.id).emit('gameUpdate', gameUpdate);
};

export const sendGameUpdateToOne = (
    game: CoupGame,
    socket: Socket,
    includeLastTurn = false,
): void => {
    const gameUpdate = getGameUpdate(game, includeLastTurn);
    socket.emit('gameUpdate', gameUpdate);
};
