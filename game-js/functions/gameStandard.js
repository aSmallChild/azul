function setNextPlayer(gameState) {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
}

function setStartingPlayer(gameState, index) {
    gameState.currentPlayerIndex = index;
}

export function addPlayer(gameState, player) {
    const { rules: { numberOfColours } } = gameState;
    gameState.players.push(player);
    gameState.factoryDisplays.push([], []);
    player.wall = Array.from(
        { length: numberOfColours },
        () => Array.from(
            { length: numberOfColours },
            () => null
        )
    );
    player.patternLines = Array.from(
        { length: numberOfColours },
        (_, y) => Array.from(
            { length: y + 1 },
            () => null
        )
    );
}

export function drawFromFactoryDisplay(gameState, factoryDisplay, player, colour, patternLineIndex = -1) {
    if (!factoryDisplay.length) {
        return {
            success: false,
            message: 'That factory display is empty.'
        };
    }

    const tiles = factoryDisplay.filter(tile => tile === colour);
    if (!tiles.length) {
        return {
            success: false,
            message: 'That colour is not in that factory display.'
        };
    }

    if (patternLineIndex < 0) {
        gameState.centerOfTable.push(...factoryDisplay.filter(tile => tile !== colour));
        factoryDisplay.splice(0, factoryDisplay.length);
        addTilesToFloorLine(gameState, player, tiles);
        return { success: true };
    }

    const placementResult = canPlaceTileInPatternLine(gameState, player, colour, patternLineIndex);
    if (!placementResult.success) {
        return placementResult;
    }

    gameState.centerOfTable.push(...factoryDisplay.filter(tile => tile !== colour));
    factoryDisplay.splice(0, factoryDisplay.length);
    addTilesToPatternLine(gameState, player, player.patternLines[patternLineIndex], tiles);
    return { success: true };
}

function drawFromCenter(gameState, player, colour, patternLineIndex = -1) {
    // TODO
}

function canPlaceTileInPatternLine(gameState, player, colour, patternLineIndex) {
    const x = getXPositionForColourOnLine(gameState, patternLineIndex, colour);
    if (player.wall[x][patternLineIndex] !== null) {
        return {
            success: false,
            message: 'You already have a tile of that colour in that row.'
        };
    }

    const patternLine = player.patternLines[patternLineIndex];
    if (patternLine.every(tile => tile !== null)) {
        return {
            success: false,
            message: 'That pattern line is already full.'
        };
    }

    const [patternLineColour] = player.patternLines[patternLineIndex];
    if (patternLineColour !== colour && patternLineColour !== null) {
        return {
            success: false,
            message: 'You already have a tile of a different colour in that patternLine.'
        };
    }

    return { success: true };
}

function canMoveTileToWall(gameState, player, patternLineIndex, wallColumnIndex) {
    const [patternLineColour] = player.patternLines[patternLineIndex];
    const targetColour = getColourForWallPosition(gameState, wallColumnIndex, patternLineIndex);
    return patternLineColour === targetColour;
}

function getColourForWallPosition(gameState, x, y) {
    return x >= y ? x - y : gameState.rules.numberOfColours + x - y;
}

function getXPositionForColourOnLine(gameState, y, colour) {
    const x = colour - y;
    return x < 0 ? x + gameState.rules.numberOfColours : x;
}

export function addTilesToPatternLine(gameState, player, patternLine, tiles) {
    const startIndex = patternLine.indexOf(null);
    const remainingSpaces = patternLine.length - startIndex;
    const numberOfTilesToAdd = Math.min(tiles.length, remainingSpaces);
    const [color] = tiles;
    for (let i = startIndex; i < numberOfTilesToAdd; i++) {
        patternLine[i] = color;
    }
    addTilesToFloorLine(gameState, player, tiles.slice(numberOfTilesToAdd));
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
