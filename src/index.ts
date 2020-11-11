import express from 'express';
import socketIo from 'socket.io';
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
import acceptAction from './listeners/coupGame/acceptAction';
import discard from './listeners/coupGame/discard';
import exchange from './listeners/coupGame/exchange';
import getGameExists from './listeners/coupGame/getGameExists';
import Users from './utils/classes/User/Users';
import createUser from './listeners/users/createUser';
import toggleReady from './listeners/lobby/toggleReady';
import leaveRoom from './listeners/lobby/leaveRoom';
import deleteRoom from './listeners/lobby/deleteRoom';

// App setup
const app = express();
const server = app.listen(4000, () => {
    console.log('Listening to requests on 4000');
});

// Socket setup
const io = socketIo(server);

// Data initialize
export const lobby = new Rooms();
export const users = new Users();

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Create user
    socket.on('createUser', createUser(socket));

    // Lobby interactions
    socket.on('joinLobby', joinLobby(socket));
    socket.on('leaveLobby', leaveLobby(socket));
    socket.on('toggleReady', toggleReady(io));

    // Lobby room CRUD
    socket.on('createGameRoom', createRoom(io, socket));
    socket.on('joinGameRoom', joinRoom(io, socket));
    socket.on('leaveGameRoom', leaveRoom(io, socket));
    socket.on('deleteGameRoom', deleteRoom(io));

    // Game start
    socket.on('startGame', startGame(io));

    // Game interactions
    socket.on('getGameExists', getGameExists(socket));
    socket.on('getGameSetup', getFirstHands(socket));
    socket.on('tryAction', tryAction(io));
    socket.on('challengeAction', challengeAction(io));
    socket.on('acceptAction', acceptAction(io));
    socket.on('tryBlock', tryBlock(io));
    socket.on('discard', discard(io));
    socket.on('exchange', exchange(io));

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});
