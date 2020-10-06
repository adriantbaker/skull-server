import { Server } from 'socket.io';
import CoupGame from '../../../utils/classes/Game/CoupGame/CoupGame';
import { Action } from '../../../utils/classes/Game/CoupGame/initializers/initializeAction';
import { sendGameUpdateToAll } from './sendGameUpdate';

const expireAction = (io: Server, game: CoupGame, action: Action) => (): void => {
    const { id, isBlock } = action;
    const expired = game.expireAction(id, isBlock);
    if (expired) {
        sendGameUpdateToAll(game, io);
    }
};

export default expireAction;
