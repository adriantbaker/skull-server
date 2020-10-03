import { Server } from 'socket.io';
import CoupGames from '../../utils/classes/Game/CoupGames';
import { GameUpdate, PlayerUpdate } from './getGameSetup';

interface challengeActionRequest {
    actionId: string,
    isBlock: boolean,
    playerId: string
    gameId: string
}

const challengeAction = (io: Server, activeGames: CoupGames) => (
    (request: challengeActionRequest): void => {
        // TODO: validate request

        console.log('Challenge action...');
        console.log(request);

        const {
            actionId, playerId, gameId, isBlock,
        } = request;
        const game = activeGames.getOne(gameId);

        const challengeOutcome = game.challenge(actionId, isBlock, playerId);

        if (challengeOutcome) {
            const gameUpdate: GameUpdate = {
                currentTurn: null,
                currentAction: game.currentAction || null,
                currentBlock: game.currentBlock || null,
            };

            // Tell all players the result of the challenge
            io.to(gameId).emit('gameUpdate', gameUpdate);

            // If player was wrongly challenged, privately tell them their new hand
            const { success, winnerId } = challengeOutcome;
            if (success === false) {
                const playerUpdate: PlayerUpdate = {
                    playerHand: game.players.getOnePrivate(winnerId),
                    opponentHands: null,
                };
                io.to(winnerId).send('playerUpdate', playerUpdate);
            }
        }

        // TODO: handle if not challengeed
    }
);

export default challengeAction;
