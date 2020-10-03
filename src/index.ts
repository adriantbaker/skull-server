import express from 'express';
import socketIo from 'socket.io';
import Games from './utils/classes/Game/CoupGames';
import createRoom from './listeners/lobby/createRoom';
import joinRoom from './listeners/lobby/joinRoom';
import startGame from './listeners/lobby/startGame';
import joinLobby from './listeners/lobby/joinLobby';
import leaveLobby from './listeners/lobby/leaveLobby';
import getFirstHands from './listeners/coupGame/getGameSetup';
import Rooms from './utils/classes/Room/Rooms';
import tryAction from './listeners/coupGame/tryAction';
import challengeAction from './listeners/coupGame/challengeAction';
import tryBlock from './listeners/coupGame/tryBlock';

// App setup
const app = express();
const server = app.listen(4000, () => {
    console.log('Listening to requests on 4000');
});

// Socket setup
const io = socketIo(server);

// Data initialize
const lobby = new Rooms();
const activeGames = new Games();

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join / leave lobby
    socket.on('joinLobby', joinLobby(socket, lobby));
    socket.on('leaveLobby', leaveLobby(socket));

    // Lobby room CRUD
    socket.on('createGameRoom', createRoom(io, socket, lobby));
    socket.on('joinGameRoom', joinRoom(io, socket, lobby));

    // Game start
    socket.on('startGame', startGame(io, lobby, activeGames));

    // Game interactions
    socket.on('getGameSetup', getFirstHands(socket, activeGames));
    socket.on('tryAction', tryAction(io, activeGames));
    socket.on('challengeAction', challengeAction(io, activeGames));
    socket.on('tryBlock', tryBlock(io, activeGames));

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});
