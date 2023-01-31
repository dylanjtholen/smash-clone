module.exports = {
    initGame,
    gameLoop,
    keyPress,
  }

  const ground = [{x: 0, y: 540, w: 960, h: 100}, {x: 430, y: 270, w: 100, h: 270}]
  const jumpableWalls = [{direction: 'right', x: 420, y: 270, w: 10, h: 270}, {direction: 'left', x: 530, y: 270, w: 10, h: 270}]
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
        let groundCenter = center(ground.x, ground.y, ground.w, ground.h)
        if (isColliding(player.character.x, player.character.y, playerWidth, playerHeight, ground.x, ground.y, ground.w, ground.h) && groundCenter.y >= player.character.y) {
          isOnGround = true
          player.character.y = (ground.y - playerHeight) - 1
          player.character.yVelocity = 0
        }
      }
      return isOnGround
  }

  function keyPress(player, key) {
    if (checkForWallJumps(player) && key == 'w') {
      player.character.yVelocity = playerSpeed * -5
      if (player.keys['a']) {
        player.character.xVelocity += playerSpeed * 7
      }
      if (player.keys['d']) {
        player.character.xVelocity -= playerSpeed * 7
      }
    }
  }

  function checkForWallJumps(player) {
    let isOnWall = false
      for (let i in gameState.jumpableWalls) {
        let jumpableWall = gameState.jumpableWalls[i]
        let jumpableWallCenter = center(jumpableWall.x, jumpableWall.y, jumpableWall.w, jumpableWall.h)
        if (isColliding(player.character.x, player.character.y, playerWidth, playerHeight, jumpableWall.x, jumpableWall.y, jumpableWall.w, jumpableWall.h)) {
          if (player.keys['a'] && jumpableWall.direction == 'left') {
          isOnWall = true
          }
          if (player.keys['d'] && jumpableWall.direction == 'right') {
          isOnWall = true
          }
        }
      }
      return isOnWall
  }

  function checkIfHeadBump(player) {
    let headBump = false
      for (let i in gameState.ground) {
        let ground = gameState.ground[i]
        let groundCenter = center(ground.x, ground.y, ground.w, ground.h)
        if (isColliding(player.character.x, player.character.y, playerWidth, playerHeight, ground.x, ground.y, ground.w, ground.h) && groundCenter.y <= player.character.y) {
          headBump = true
          player.character.y = ground.y + ground.h + 1
          player.character.yVelocity *= -0.1
        }
      }
      return headBump
  }

function checkFutureSideCollisions(player, distance, add1) {
  for (let i in gameState.ground) {
    let ground = gameState.ground[i]
    let groundCenter = center(ground.x, ground.y, ground.w, ground.h)
    if (isColliding(player.character.x + distance, player.character.y - add1, playerWidth, playerHeight, ground.x, ground.y, ground.w, ground.h)) {
      //player.character.x = ground.x + ground.w + 1
      return true
    }
  }
}

  function center(x, y, w, h) {
    return {x: x + w / 2, y: y + h / 2}
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
      ground: ground,
      jumpableWalls: jumpableWalls
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
      if (player.keys['a'] && player.character.xVelocity >= -15 && (!checkFutureSideCollisions(player, -playerSpeed) || player.character.isOnGround)) {
        player.character.xVelocity -= playerSpeed
      }
      if (player.keys['d'] && player.character.xVelocity <= 15 && (!checkFutureSideCollisions(player, playerSpeed) || player.character.isOnGround)) {
        player.character.xVelocity += playerSpeed
      }

      if (player.character.isOnGround) {
        player.character.yVelocity = 0
      } else {
        player.character.yVelocity += gravity
      }

      if (player.keys['w'] && player.character.isOnGround) {
        player.character.yVelocity -= playerSpeed * 5
      }

      if (checkForWallJumps(player) && !player.character.isOnGround && player.character.yVelocity >= 0) {
        player.character.yVelocity = 2
      }

      if (!player.character.headBump) {
      player.character.y += player.character.yVelocity
      }

      if (!checkFutureSideCollisions(player, player.character.xVelocity, true)) {
      player.character.x += player.character.xVelocity
      } else if (!checkFutureSideCollisions(player, player.character.xVelocity, false)) {
        player.character.x += player.character.xVelocity
      } else {
        if (player.character.xVelocity)
        player.character.xVelocity = 0
      }

      if (player.character.xVelocity != 0) {
      player.character.xVelocity -= player.character.xVelocity / Math.abs(player.character.xVelocity)
      }
      player.character.isOnGround = checkIfOnGround(player)
      player.character.headBump = checkIfHeadBump(player)
    }
  }
    
    return gameState
  }