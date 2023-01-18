module.exports = {
    initGame,
    gameLoop,
  }

  const ground = [{x: 0, y: 540, w: 960, h: 100}, {x: 430, y: 270, w: 100, h: 100}]
  const playerSpeed = 3
  const gravity = 1
  
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
      if (player.keys['w']) {
        player.character.yVelocity -= playerSpeed
      }
      if (player.keys['a'] && player.character.xVelocity >= -15) {
        player.character.xVelocity -= playerSpeed
      }
      if (player.keys['d'] && player.character.xVelocity <= 15) {
        player.character.xVelocity += playerSpeed
      }
      player.character.yVelocity += gravity
      player.character.x += player.character.xVelocity
      player.character.y += player.character.yVelocity
      if (player.character.xVelocity != 0) {
      player.character.xVelocity -= player.character.xVelocity / Math.abs(player.character.xVelocity)
      }
    }
  }
    
    return gameState;
  }