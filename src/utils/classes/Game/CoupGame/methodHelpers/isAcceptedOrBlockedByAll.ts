import { Action } from '../initializers/initializeAction';

const isAcceptedOrBlockedByAll = (action: Action): boolean => {
    const { acceptedBy, blockedBy } = action;
    const players = Object.keys(acceptedBy);
    return players.every((player) => acceptedBy[player] || blockedBy[player]);
};

export default isAcceptedOrBlockedByAll;
