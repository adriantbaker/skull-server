import CoupPlayers from '../../../Player/CoupPlayers';

export type InputByPlayers = { [key: string]: boolean }

const initializeInputByPlayers = (players: CoupPlayers, playerId: string): InputByPlayers => {
    // When a player attempts an action, we keep track of whether
    // the opponents have accepted it. Initially, no one has accepted it
    const inputByPlayers: InputByPlayers = {};
    const opponentIds = players.getOpponentIds(playerId);
    opponentIds.forEach((opponentId) => {
        inputByPlayers[opponentId] = false;
    });
    return inputByPlayers;
};

export default initializeInputByPlayers;
