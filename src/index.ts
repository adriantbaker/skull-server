import express from 'express';
import socketIo from 'socket.io';
import Games from './utils/classes/Games/Games';
import createGame from './listeners/lobby/createGame';
import joinGame from './listeners/lobby/joinGame';
import startGame from './listeners/lobby/startGame';
import joinLobby from './listeners/lobby/joinLobby';
import leaveLobby from './listeners/lobby/leaveLobby';
import getFirstHands from './listeners/coupGame/getFirstHands';
import Game from './utils/classes/Game/Game';
import CoupGame from './utils/classes/Game/CoupGame';
import CoupPlayer from './utils/classes/Player/CoupPlayer';
import Player from './utils/classes/Player/Player';
import Players from './utils/classes/Players/Players';
import CardGame from './utils/classes/Game/CardGame';
import CardPlayers from './utils/classes/Players/CardPlayers';

// App setup
const app = express();
const server = app.listen(4000, () => {
    console.log('Listening to requests on 4000');
});

// Socket setup
const io = socketIo(server);

// Data initialize
const lobby = new Games();
const activeGames = new Games();

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join / leave lobby
    socket.on('joinLobby', joinLobby(socket, lobby));
    socket.on('leaveLobby', leaveLobby(socket));

    // Lobby game CRUD
    socket.on('createGame', createGame(io, socket, lobby));
    socket.on('joinGame', joinGame(io, socket, lobby));
    socket.on('startGame', startGame(io, socket, lobby, activeGames));

    // Game interactions
    socket.on('getFirstHands', getFirstHands(socket, activeGames));

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});
