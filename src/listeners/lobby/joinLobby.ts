import CoupGames from '../../utils/classes/Game/CoupGames';

const joinLobby = (socket, lobby: CoupGames) => () => {
    socket.join('gameLobby');
    console.log('Sending games');
    console.log(lobby.getGamesPublic());
    socket.emit('games', lobby.getGamesPublic());
};

module.exports = joinLobby;
