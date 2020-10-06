import { Server } from 'socket.io';
import CoupGames from '../../utils/classes/Game/CoupGames';
import { sendGameUpdateToAll } from './helpers/sendGameUpdate';
import { sendPlayerUpdateByPrivateRoom } from './helpers/sendPlayerUpdate';

interface challengeActionRequest {
    actionId: string,
    isBlock: boolean,
    playerId: string
    gameId: string
}

const challengeAction = (io: Server, activeGames: CoupGames) => (
    (request: challengeActionRequest): void => {
        // TODO: validate request

        const {
            actionId, playerId, gameId, isBlock,
        } = request;
        const game = activeGames.getOne(gameId);

        const challengeOutcome = game.challenge(actionId, isBlock, playerId);

        if (challengeOutcome) {
            // Tell all players the result of the challenge
            sendGameUpdateToAll(game, io);

            // If player was wrongly challenged, privately tell them their new hand
            const { success, winnerId } = challengeOutcome;
            if (success === false) {
                sendPlayerUpdateByPrivateRoom(winnerId, game, io);
            }
        }

        // TODO: handle if not challengeed
    }
);

export default challengeAction;
