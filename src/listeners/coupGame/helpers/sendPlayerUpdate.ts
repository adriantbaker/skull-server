import { Server, Socket } from 'socket.io';
import CoupGame from '../../../utils/classes/Game/CoupGame/CoupGame';
import { CoupPlayerPrivate, CoupPlayerPublic } from '../../../utils/classes/Player/CoupPlayer';
import CoupPlayers from '../../../utils/classes/Player/CoupPlayers';

export interface PlayerUpdate {
    playerHand: CoupPlayerPrivate | null,
    opponentHands: Array<CoupPlayerPublic> | null
}

const getPlayerUpdate = (playerId: string, players: CoupPlayers): PlayerUpdate => {
    const playerHand = players.getOnePrivate(playerId);
    const opponentHands = players.getOpponentsPublic(playerId);

    const playerUpdate: PlayerUpdate = {
        playerHand,
        opponentHands,
    };
    return playerUpdate;
};

export const sendPlayerUpdateBySocket = (
    playerId: string,
    game: CoupGame,
    socket: Socket,
): void => {
    const playerUpdate = getPlayerUpdate(playerId, game.players);
    socket.emit('playerUpdate', playerUpdate);
};

export const sendPlayerUpdateByPrivateRoom = (
    playerId: string,
    game: CoupGame,
    io: Server,
): void => {
    const playerUpdate = getPlayerUpdate(playerId, game.players);
    io.to(playerId).emit('playerUpdate', playerUpdate);
};
