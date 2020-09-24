const express = require('express');
const socket = require('socket.io');
const Games = require('./utils/classes/Games');
const Game = require('./utils/classes/Game');

// App setup
const app = express();
const server = app.listen(4000, () => {
    console.log("Listening to requests on 4000");
})

// Socket setup
const io = socket(server);

const lobby = new Games();

io.on('connection', (socket) => {
    console.log('Socket connected: ' + socket.id);
    socket.join('gameLobby');
    socket.emit('games', lobby.getGames());

    socket.on('createGame', (request) => {
        console.log('Creating game...')
        const { gameName, ownerName } = request;
        // Add game to lobby
        const game = new Game(gameName, ownerName);
        lobby.addGame(game);

        // Notify lobby and creator of new game
        io.to('gameLobby').emit('games', lobby.getGames());
        socket.emit('createGameResponse', game);

        // Subscribe user to game room, leave lobby
        const gameId = game.id;
        socket.leave('gameLobby');
        socket.join(gameId);
    })

    socket.on('joinGame', (request) => {
        console.log('Player is joining game...')
        const { gameId, playerName } = request;
        // Add user to game
        const game = lobby.getGame(gameId);
        game.addPlayer(playerName);

        // Subscribe user to game room, leave lobby
        socket.leave('gameLobby');
        socket.join(gameId);

        // Notify lobby and game room that player joined
        io.to('gameLobby').emit('games', lobby.getGames());
        io.to(gameId).emit('players', game.players)
    })

    socket.on('startGame', (request) => {
        console.log('Game owner is starting game...');
        const { gameId, ownerName } = request;

        const game = lobby.getGame(gameId);
        game.startGame();

        console.log(game);
    })


    socket.on('disconnect', () => {
        console.log('Socket disconnected: ' + socket.id);
    })
})

