function setNextPlayer(gameState) {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
}

function setStartingPlayer(gameState, index) {
    gameState.currentPlayerIndex = index;
}

export function addPlayer(gameState, player) {
    gameState.players.push(player);
    gameState.factoryDisplays.push([], []);
}

function drawFromFactory(gameState, factoryDisplay, player, colour, patternLineIndex = -1) {
    // TODO
}

function drawFromCenter(gameState, player, colour, patternLineIndex = -1) {
    // TODO
}

function canPlaceTileAtTarget(player, colour, patternLineIndex) {

}

export function addTilesToFloorLine(gameState, player, tiles) {
    const numberOfTilesToAdd = gameState.rules.floorLinePenalties.length - player.floorLine.length;
    player.floorLine = player.floorLine.concat(tiles.slice(0, numberOfTilesToAdd));
    gameState.discardedTiles = gameState.discardedTiles.concat(tiles.slice(numberOfTilesToAdd));
}

export function dealTilesToFactoryDisplays(gameState) {
    gameState.centerOfTable = [-1];
    const tilesPerFactoryDisplay = gameState.rules.numberOfColours - 1;
    for (let i = 0; i < gameState.factoryDisplays.length; i++) {
        gameState.factoryDisplays[i] = gameState.tileBag.splice(0, tilesPerFactoryDisplay);
        if (gameState.tileBag.length === 0) {
            refillTileBag(gameState);
        }
        const missingTiles = tilesPerFactoryDisplay - gameState.factoryDisplays[i].length;
        if (missingTiles) {
            gameState.factoryDisplays[i] = gameState.tileBag.splice(0, missingTiles);
        }
    }
}

function scoreRound() {
    // TODO

    // place tile if possible
    // score for adding the tile
    // score for completing rows
    // score for completing columns
    // score for completing colours
    // deduct points for floor line
}

export function fillTileBag(gameState) {
    const { rules } = gameState;
    for (let i = 0; i < rules.numberOfColours; i++) {
        for (let j = 0; j < rules.tilesPerColour; j++) {
            gameState.tileBag.push(i);
        }
    }
    shuffleTiles(gameState.tileBag);
}

function refillTileBag(gameState) {
    shuffleTiles(gameState.discardedTiles);
    gameState.tileBag = gameState.discardedTiles;
    gameState.discardedTiles = [];
}

function shuffleTiles(tiles) {
    return tiles.sort(() => Math.random() - 0.5);
}
