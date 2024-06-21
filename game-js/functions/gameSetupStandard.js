function setNextPlayer(gameState) {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
}

function setStartingPlayer(gameState, index) {
    gameState.currentPlayerIndex = index;
}

function addPlayer(gameState, player) {
    gameState.players.push(player);
    gameState.factoryTiles.push([], []);
}

function drawFromFactoryToPatternLine(factory, center, player, patternLineIndex, colour) {
    // TODO
}

function drawFromCenterToPatternLine(center, player, patternLineIndex, colour) {
    // TODO
}

function drawFromCenterToFloorLine(center, player, colour) {
    // TODO
}

function drawFromFactoryToFloorLine(factory, player, colour) {
    // TODO
}
