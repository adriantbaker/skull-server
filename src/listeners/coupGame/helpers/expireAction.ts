import { Server } from 'socket.io';
import CoupGame from '../../../utils/classes/Game/CoupGame/CoupGame';
import { Action } from '../../../utils/classes/Game/CoupGame/initializers/initializeAction';
import { GameUpdate } from '../getGameSetup';

const expireAction = (io: Server, game: CoupGame, action: Action) => (): void => {
    const { id, isBlock } = action;
    const expired = game.expireAction(id, isBlock);
    if (expired) {
        const gameUpdate: GameUpdate = {
            currentTurn: null,
            currentAction: game.currentAction || null,
            currentBlock: game.currentBlock || null,
        };
        io.emit('gameUpdate', gameUpdate);
    }
};

export default expireAction;
