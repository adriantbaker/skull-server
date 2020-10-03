import CoupPlayers from '../Player/CoupPlayers';

export type AcceptedBy = { [key: string]: boolean }

const initializeAcceptedBy = (players: CoupPlayers, playerId: string): AcceptedBy => {
    // When a player attempts an action, we keep track of whether
    // the opponents have accepted it. Initially, no one has accepted it
    const acceptedBy: AcceptedBy = {};
    const opponentIds = players.getOpponentIds(playerId);
    opponentIds.forEach((opponentId) => {
        acceptedBy[opponentId] = false;
    });
    return acceptedBy;
};

export default initializeAcceptedBy;
