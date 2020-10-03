import { Socket } from 'socket.io';
import CoupGames from '../../utils/classes/Game/CoupGames';
import { Action } from '../../utils/classes/Game/CoupGame';
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
    }
);

export default getGameSetup;
