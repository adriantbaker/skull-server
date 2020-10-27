import CoupGame from '../../../utils/classes/Game/CoupGame/CoupGame';
import CoupPlayer from '../../../utils/classes/Player/CoupPlayer';
import Room from '../../../utils/classes/Room/Room';

const findPlayerInGameOrRoom = (playerId: string, gameOrRoom: CoupGame | Room): CoupPlayer => {
    const player = gameOrRoom.players.getOne(playerId);

    return player;
};

export default findPlayerInGameOrRoom;
