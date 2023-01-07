let playerNumber;
let gameActive = false;
let canvas = document.getElementById('canvas'); 
let c;
let bound

let gameState

let exitupgrades
let arrowLeft
let arrowRight

let mouseDown;
let mousex
let mousey

const ground = [{ x: 960, y: 0, w: 100, h: 1060 }, { x: 0, y: 230, w: 350, h: 80 }, { x: 255, y: 10, w: 100, h: 300 }, { x: 35, y: 5, w: 315, h: 85 }, { x: 30, y: 5, w: 95, h: 625 }, { x: 30, y: 550, w: 325, h: 85 }, { x: 255, y: 325, w: 100, h: 305 }, { x: 260, y: 330, w: 315, h: 80 }, { x: 475, y: 330, w: 105, h: 207 }, { x: 475, y: 455, w: 260, h: 80 }, { x: 635, y: 135, w: 100, h: 405 }, { x: 385, y: 135, w: 350, h: 85 }, { x: 385, y: 35, w: 95, h: 180 }, { x: 385, y: 40, w: 510, h: 85 }, { x: 800, y: 40, w: 95, h: 340 }, { x: 800, y: 290, w: 160, h: 85 }]

const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
let server = urlParams.get('g') || 'https://dylanjtholen-bug-free-lamp-7grqpxq7jwcwj9-3000.preview.app.github.dev/'

const socket = io(server);

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('gameAlreadyStarted', handleGameAlreadyStarted)
socket.on('usernameTooLong', handleUsernameTooLong);
socket.on('noUsername', handleNoUsername)

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const startGameBtn = document.getElementById('startGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const usernameInput = document.getElementById('usernameInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const copyCodeBtn = document.getElementById('copyButton');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
startGameBtn.addEventListener('click', startGame)
copyCodeBtn.addEventListener('click', copyGameCode)

canvas.addEventListener('mousemove', function () {
  let pos = findPos(canvas)
  mousex = event.clientX - (((window.innerWidth - canvas.width) / 2) + (canvas.width / 10))
  mousey = event.clientY - (window.innerHeight - canvas.height) / 2
  socket.emit('mousemove', {x: mousex, y: mousey, playerNumber: playerNumber})
})
canvas.addEventListener('mousedown', function () {
  mouseDown = true
})

function newGame() {
    alert(server)
  socket.emit('newGame', usernameInput.value);
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  gameCodeDisplay.innerText = code;
  startGameBtn.remove()
  socket.emit('joinGame', {roomName: code, username: usernameInput.value});
  init();
}

function startGame() {
  socket.emit('startGame')
  startGameBtn.remove()
}

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  
  canvas = document.getElementById('canvas');
  c = canvas.getContext('2d');

  canvas.width = 1060;
  canvas.height = 640;

  c.fillStyle = 'gray';
  c.fillRect(0, 0, canvas.width, canvas.height);
  bound = canvas.getBoundingClientRect();

  document.getElementById('stylesheet').setAttribute('href', 'style.css')
  document.getElementById('stylesheet').removeAttribute('integrity')
  document.getElementById('stylesheet').removeAttribute('crossorigin')

  gameActive = true;    
}

function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
      return { x: curleft, y: curtop };
    }
    return undefined;
  }
  
  function distance(x, y, x2, y2) {
    return Math.sqrt((x - x2) ** 2 + (y - y2) ** 2)
  }
  
  function isColliding(x, y, w, h, x2, y2, w2, h2) {
    if ((((x <= x2) && ((x + w) >= (x2 + w2))) || ((x >= x2) && (x <= (x2 + w2)) || (((x + w) >= x2) && ((x + w) <= (x2 + w2))))) && (((y >= y2) && (y <= (y2 + h2)) || (((y + h) >= y2) && ((y + h) <= (y2 + h2)))) || ((y <= y2) && ((y + h) >= (y2 + h2))))) {
      return true
    } else if (((x <= x2) && ((x + w) >= (x2 + w2))) && ((y <= y2) && ((y + h) >= (y2 + h2)))) {
      return true
    } else {
      return false
    }
  }
  
  function lineLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  
    // calculate the distance to intersection point
    let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  
    // if uA and uB are between 0-1, lines are colliding
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
  
      // where the lines meet
      let intersectionX = x1 + (uA * (x2-x1));
      let intersectionY = y1 + (uA * (y2-y1));
  
      return true;
    }
    return false;
  }
  
  function rectLineIntersection(rx, ry, rw, rh, lx1, ly1, lx2, ly2) {
    let intersecting = false
    if (lineLineIntersection(lx1, ly1, lx2, ly2, rx, ry, rx, ry + rh) || lineLineIntersection(lx1, ly1, lx2, ly2, rx, ry + rh, rx + rw, ry + rh) || lineLineIntersection(lx1, ly1, lx2, ly2, rx + rw, ry + rh, rx + rw, ry) || lineLineIntersection(lx1, ly1, lx2, ly2, rx, ry, rx + rw, ry)) {
      intersecting = true
    }
    return intersecting
  
  }
  
  function checkCollision(x, y, w, h) {
    let valid = []
    for (let i in gameState.players) {
      let player = gameState.players[i]
      if (isColliding(gameState.players[i].position.x - player.size, gameState.players[i].position.y - player.size, player.size * 2, player.size * 2, x, y, w, h)) {
        valid.push(player)
      }
    }
    for (let i in gameState.players) {
      let player = gameState.players[i]
      if (isColliding(x, y, w, h, gameState.players[i].position.x - player.size, gameState.players[i].position.y - player.size, player.size * 2, player.size * 2)) {
        valid.push(player)
      }
    }
    for (let i in ground) {
      if (isColliding(x, y, w, h, ground[i].x, ground[i].y, ground[i].w, ground[i].h)) {
        valid.push(ground[i])
      }
    }
    for (let i in ground) {
      if (isColliding(ground[i].x, ground[i].y, ground[i].w, ground[i].h, x, y, w, h)) {
        valid.push(ground[i])
      }
    }
    if (valid.length > 0) {
      return true
    } else {
      return false
    }
  }

function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

function copyGameCode() {
  navigator.clipboard.writeText(gameCodeDisplay.innerText)
}

function drawGame(state) {
  gameState = state
  gamespeed = state.gamespeed
  
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(state) {
  if (!gameActive) {
  return
  }
  let gameState = JSON.parse(state);
  let playersList = ''
    for (let i in gameState.players) {
      let player = gameState.players[i]
      playersList += `<p>${player.username}</p>`
    }
    document.getElementById('playersDiv').innerHTML = playersList
  if (!gameState.gameStarted) {
    return;
  }
  requestAnimationFrame(() => drawGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}

function handleTooManyPlayers() {
  reset();
  alert('This game is full');
}

function handleGameAlreadyStarted() {
  reset();
  alert('This game is already in progress')
}

function handleUsernameTooLong() {
  reset();
  alert('Username too long')
}

function handleNoUsername() {
  reset();
  alert('Invalid username')
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
  location.reload()
}