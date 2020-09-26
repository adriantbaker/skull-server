const express = require('express');
const socket = require('socket.io');
const Games = require('./utils/classes/Games');
const Game = require('./utils/classes/Game');
const createGame = require('./listeners/lobby/createGame');
const joinGame = require('./listeners/lobby/joinGame');
const startGame = require('./listeners/lobby/startGame');
const joinLobby = require('./listeners/lobby/joinLobby');
const leaveLobby = require('./listeners/lobby/leaveLobby');

// App setup
const app = express();
const server = app.listen(4000, () => {
    console.log("Listening to requests on 4000");
})

// Socket setup
const io = socket(server);

const lobby = new Games();
const activeGames = new Games();

io.on('connection', (socket) => {
    console.log('Socket connected: ' + socket.id);

    // Join / leave lobby
    socket.on('joinLobby', joinLobby(socket, lobby));
    socket.on('leaveLobby', leaveLobby(socket));

    // Lobby game CRUD
    socket.on('createGame', createGame(io, socket, lobby));
    socket.on('joinGame', joinGame(io, socket, lobby));
    socket.on('startGame', startGame(io, socket, lobby, activeGames));

    socket.on('disconnect', () => {
        console.log('Socket disconnected: ' + socket.id);
    })
})

