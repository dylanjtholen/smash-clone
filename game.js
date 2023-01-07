module.exports = {
    initGame,
    gameLoop,
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
      players: []
    };
  }
  
  function gameLoop(state) {
    if (!state) {
      return;
    }
    gameState = state
    deltaTime = (new Date().getTime() - lastFrameTimeStamp)/20;
    lastFrameTimeStamp = new Date().getTime()
    
    return gameState;
  }