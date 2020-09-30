import { Socket } from 'socket.io';
import CoupGames from '../../utils/classes/Game/CoupGames';

interface getFirstHandsRequest {
    gameId: string
    playerId: string
}

const getFirstHands = (socket: Socket, activeGames: CoupGames) => (
    (request: getFirstHandsRequest): void => {
        const { gameId, playerId } = request;
        const game = activeGames.getOne(gameId);
        const playerHand = game.players.getOnePrivate(playerId);
        const opponentHands = game.players.getOpponentsPublic(playerId);
        socket.emit('getFirstHandsResponse', { playerHand, opponentHands });
    }
);

export default getFirstHands;
