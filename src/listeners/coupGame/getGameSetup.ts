import { Socket } from 'socket.io';
import CoupGames from '../../utils/classes/Game/CoupGames';
import { Action } from '../../utils/classes/Game/initializeAction';
import { CoupPlayerPrivate, CoupPlayerPublic } from '../../utils/classes/Player/CoupPlayer';

interface GetGameSetupRequest {
    gameId: string
    playerId: string
}

export interface GameUpdate {
    currentTurn: number | null,
    currentAction: Action | null,
    currentBlock: Action | null
}

export interface PlayerUpdate {
    playerHand: CoupPlayerPrivate | null,
    opponentHands: Array<CoupPlayerPublic> | null
}

const getGameSetup = (socket: Socket, activeGames: CoupGames) => (
    (request: GetGameSetupRequest): void => {
        const { gameId, playerId } = request;
        const game = activeGames.getOne(gameId);
        const { currentTurn, players } = game;
        const playerHand = players.getOnePrivate(playerId);
        const opponentHands = players.getOpponentsPublic(playerId);
        const gameUpdate: GameUpdate = {
            currentTurn,
            currentAction: null,
            currentBlock: null,
        };
        const playerUpdate: PlayerUpdate = {
            playerHand,
            opponentHands,
        };
        socket.emit('gameUpdate', gameUpdate);
        socket.emit('playerUpdate', playerUpdate);
        socket.join(playerId); // Each player will be in a unique room alone for private messages
    }
);

export default getGameSetup;
