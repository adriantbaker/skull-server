import CoupPlayers from '../../../Player/CoupPlayers';
import { InputByPlayers } from '../initializers/initializeInputByPlayers';

const isAcceptedByAll = (acceptedBy: InputByPlayers, players: CoupPlayers): boolean => {
    const activePlayerIds = players.getActivePlayerIds();
    return Object
        .keys(acceptedBy)
        .filter((playerId) => activePlayerIds.includes(playerId))
        .every((playerId) => acceptedBy[playerId]);
};

export default isAcceptedByAll;
