import { Server } from 'socket.io';
import { lobby } from '../..';
import { sendGameUpdateToAll } from './helpers/sendGameUpdate';
import { sendPlayerUpdateToAll } from './helpers/sendPlayerUpdate';

interface discardRequest {
    cardIds: Array<number>
    playerId: string
    gameId: string
}

const discard = (io: Server) => (
    (request: discardRequest): void => {
        // TODO: validate request

        const { cardIds, playerId, gameId } = request;

        const room = lobby.getOne(gameId);
        const { game } = room;

        if (!game) {
            console.log(`Tried to discard on non-existent Game ${gameId}`);
            return;
        }

        const { validRequest, turnAdvanced } = game.discard(playerId, cardIds);

        if (turnAdvanced && game.won) {
            // That ended the game - send everyone back to the waiting room
            const { winnerId, winnerName } = game;
            room.endGame();
            io.to(room.id).emit('updateRoom', { players: room.players.getAllPublic() });
            io.to(room.id).emit('endGame', { winnerId, winnerName });
        }

        if (validRequest) {
            sendGameUpdateToAll(game, io, turnAdvanced);
            sendPlayerUpdateToAll(game, io);
        }
    }
);

export default discard;
