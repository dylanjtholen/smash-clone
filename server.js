const io = require('socket.io')();
const { initGame, gameLoop } = require('./game');

const state = {};
const clientRooms = {};
const FRAME_RATE = 60

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

io.on('connection', client => {
  console.log(client)
  client.on("disconnecting", handleDisconnect);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);
  client.on('startGame', handleStartGame)

  function handleJoinGame({roomName, username}) {
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    } else if (numClients > 3) {
      client.emit('tooManyPlayers');
      return;
    }

    if (state[roomName].gameStarted) {
      client.emit('gameAlreadyStarted')
      return
    }

    if (username.length >= 15) {
      client.emit('usernameTooLong')
      return
    }

    if (!username) {
      client.emit('noUsername')
      return
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    state[roomName].players.push({username: username, id: client.id})
    client.number = 2;
    client.emit('init', 2);
      }

  function handleDisconnect() {
    try {
    let roomName = clientRooms[client.id]
    let clientNumber
    for (let i = state[roomName].players.length -1; i >= 0; i--) {
      if (state[roomName].players[i].id == client.id) {
        clientNumber = i
        state[roomName].players.splice(clientNumber, 1)
        break
      }
    }
  } catch (err) {
    console.log('error')
  }
  }

  function handleNewGame(username) {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    if (username.length >= 15) {
      client.emit('usernameTooLong')
      return
    }

    if (!username) {
      client.emit('noUsername')
      return
    }

    state[roomName] = initGame();
    state[roomName].players.push({username: username, id: client.id})

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
    console.log('created room: ' + roomName)
    startGameInterval(roomName);
  }

  function handleStartGame() {
    let roomName = clientRooms[client.id]
    state[roomName].gameStarted = true
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    let tempState = state[roomName]
    state[roomName] = gameLoop(tempState);
      emitGameState(roomName, state[roomName])
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

let port = process.env.PORT || 3000
console.log('server listening on port: ' + port)
io.listen(port);