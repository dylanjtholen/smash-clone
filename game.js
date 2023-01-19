module.exports = {
    initGame,
    gameLoop,
  }

  const ground = [{x: 0, y: 540, w: 960, h: 100}, {x: 430, y: 270, w: 100, h: 100}]
  const playerSpeed = 4
  const gravity = 1
  const playerWidth = 64
  const playerHeight = 64

  function isColliding(x, y, w, h, x2, y2, w2, h2) {
    if ((((x <= x2) && ((x + w) >= (x2 + w2))) || ((x >= x2) && (x <= (x2 + w2)) || (((x + w) >= x2) && ((x + w) <= (x2 + w2))))) && (((y >= y2) && (y <= (y2 + h2)) || (((y + h) >= y2) && ((y + h) <= (y2 + h2)))) || ((y <= y2) && ((y + h) >= (y2 + h2))))) {
      return true
    } else if (((x <= x2) && ((x + w) >= (x2 + w2))) && ((y <= y2) && ((y + h) >= (y2 + h2)))) {
      return true
    } else {
      return false
    }
  }

  function checkIfOnGround(player) {
    let isOnGround = false
      for (let i in gameState.ground) {
        let ground = gameState.ground[i]
        if (isColliding(player.character.x, player.character.y, playerWidth, playerHeight, ground.x, ground.y, ground.w, ground.h)) {
          isOnGround = true
        }
      }
      return isOnGround
  }
  
  function initGame() {
    const state = createGameState()
    return state;
  }
  
  let gameState
  let deltaTime
  let lastFrameTimeStamp
  
  function createGameState() {
    return {
      gameStarted: false,
      players: [],
      ground: ground
    };
  }
  
  function gameLoop(state) {
    if (!state) {
      return;
    }
    gameState = state
    deltaTime = (new Date().getTime() - lastFrameTimeStamp)/20;
    lastFrameTimeStamp = new Date().getTime()

    if (gameState.gameStarted) {

    for (let i in gameState.players) {
      let player = gameState.players[i]
      if (player.keys['a'] && player.character.xVelocity >= -15) {
        player.character.xVelocity -= playerSpeed
      }
      if (player.keys['d'] && player.character.xVelocity <= 15) {
        player.character.xVelocity += playerSpeed
      }

      player.character.isOnGround = checkIfOnGround(player)

      if (player.character.isOnGround) {
        player.character.yVelocity = 0
        let aboveGround = false
        while (!aboveGround) {
          player.character.y -= 5
          aboveGround = checkIfOnGround(player)
        }
      } else {
        player.character.yVelocity += gravity
      }

      if (player.keys['w'] && player.character.isOnGround) {
        player.character.yVelocity -= playerSpeed * 5
      }

      player.character.x += player.character.xVelocity
      player.character.y += player.character.yVelocity
      if (player.character.xVelocity != 0) {
      player.character.xVelocity -= player.character.xVelocity / Math.abs(player.character.xVelocity)
      }
    }
  }
    
    return gameState;
  }