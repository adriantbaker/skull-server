import { Socket } from 'socket.io';
import CoupGames from '../../utils/classes/Game/CoupGames';

interface getFirstHandsRequest {
    gameId: string
    playerId: string
}

const getFirstHands = (socket: Socket, activeGames: CoupGames) => (
    (request: getFirstHandsRequest) => {
        const { gameId, playerId } = request;
        const game = activeGames.getOne(gameId);
        const playerHand = game.players.getOnePublic(playerId);
        const opponentHands = game.players.getOpponentsPublic(playerId);
        socket.emit('getFirstHandsResponse', { playerHand, opponentHands });
    }
);

module.exports = getFirstHands;
