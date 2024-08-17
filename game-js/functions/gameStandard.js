import { createTile } from '../models/tile.js';

function setNextPlayer(gameState) {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
}

function setStartingPlayer(gameState, index) {
    gameState.currentPlayerIndex = index;
}

export function addPlayer(gameState, player) {
    const { rules: { numberOfColours }, players, factoryDisplays } = gameState;
    player.index = players.length;
    players.push(player);
    factoryDisplays.push([], []);
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
    gameState.emit('player-added', { player });
    gameState.emit('factory-display-added', { factoryDisplays, displaysAdded: 2 });
    return player;
}

export function drawFromFactoryDisplay(gameState, factoryDisplay, player, colourId, patternLineIndex = -1) {
    const { tiles = null, ...drawResult } = canDrawFromLocation(factoryDisplay, colourId, 'that factory display');
    if (!drawResult.success) {
        return drawResult;
    }

    if (patternLineIndex >= 0) {
        const placementResult = canPlaceTileInPatternLine(gameState, player, colourId, patternLineIndex);
        if (!placementResult.success) {
            return placementResult;
        }
    }

    gameState.centerOfTable = gameState.centerOfTable.concat(factoryDisplay.filter(tile => tile.colourId !== colourId));
    factoryDisplay.splice(0, factoryDisplay.length);
    if (patternLineIndex < 0) {
        addTilesToFloorLine(gameState, player, tiles);
    }
    else {
        addTilesToPatternLine(gameState, player, player.patternLines[patternLineIndex], tiles);
    }

    return { success: true };
}

export function drawFromCenter(gameState, player, colourId, patternLineIndex = -1) {
    const center = gameState.centerOfTable;
    const { tiles = null, ...drawResult } = canDrawFromLocation(center, colourId, 'in the center of the table');
    if (!drawResult.success) {
        return drawResult;
    }

    if (patternLineIndex >= 0) {
        const placementResult = canPlaceTileInPatternLine(gameState, player, colourId, patternLineIndex);
        if (!placementResult.success) {
            return placementResult;
        }
    }

    if (center[0].colourId === -1) {
        addTilesToFloorLine(gameState, player, [center.shift()]);
        gameState.nextRoundStartingPlayerIndex = player.index;
    }

    gameState.centerOfTable = center.filter(tile => tile.colourId !== colourId);
    if (patternLineIndex < 0) {
        addTilesToFloorLine(gameState, player, tiles);
    }
    else {
        addTilesToPatternLine(gameState, player, player.patternLines[patternLineIndex], tiles);
    }

    return { success: true };
}

function canDrawFromLocation(availableTiles, colourIdToDraw, locationName) {
    if (!availableTiles.length) {
        return {
            success: false,
            message: `There are no tiles in ${locationName}.`
        };
    }

    const tiles = availableTiles.filter(tile => tile.colourId === colourIdToDraw);
    if (!tiles.length) {
        return {
            success: false,
            message: `That colour is not in ${locationName}.`
        };
    }

    return { success: true, tiles };
}

function canPlaceTileInPatternLine(gameState, player, colourId, patternLineIndex) {
    const x = getXPositionForColourOnLine(gameState, patternLineIndex, colourId);
    if (player.wall[x][patternLineIndex] !== null) {
        return {
            success: false,
            message: 'You already have a tile of that colour in that row.'
        };
    }

    const patternLine = player.patternLines[patternLineIndex];
    if (patternLine.every(tile => tile)) {
        return {
            success: false,
            message: 'That pattern line is already full.'
        };
    }

    const [firstTile] = player.patternLines[patternLineIndex];
    if (firstTile && firstTile.colourId !== colourId) {
        return {
            success: false,
            message: 'You already have a tile of a different colour in that patternLine.'
        };
    }

    return { success: true };
}

function canMoveTileToWall(gameState, player, patternLineIndex, wallColumnIndex) {
    const [patternLineTile] = player.patternLines[patternLineIndex];
    const targetColourId = getColourForWallPosition(gameState, wallColumnIndex, patternLineIndex);
    return patternLineTile?.colourId === targetColourId;
}

export function getColourForWallPosition(gameState, x, y) {
    return x >= y ? x - y : gameState.rules.numberOfColours + x - y;
}

function getXPositionForColourOnLine(gameState, y, colourId) {
    const x = colourId - y;
    return x < 0 ? x + gameState.rules.numberOfColours : x;
}

export function addTilesToPatternLine(gameState, player, patternLine, tiles) {
    const startIndex = patternLine.indexOf(null);
    const remainingSpaces = patternLine.length - startIndex;
    const numberOfTilesToAdd = Math.min(tiles.length, remainingSpaces);
    for (let i = startIndex; i < numberOfTilesToAdd; i++) {
        patternLine[i] = tiles.shift();
    }
    addTilesToFloorLine(gameState, player, tiles);
}

export function addTilesToFloorLine(gameState, player, tiles) {
    const numberOfTilesToAdd = gameState.rules.floorLinePenalties.length - player.floorLine.length;
    player.floorLine = player.floorLine.concat(tiles.slice(0, numberOfTilesToAdd));
    gameState.discardedTiles = gameState.discardedTiles.concat(tiles.slice(numberOfTilesToAdd));
}

export function shiftStartTileToCenter(gameState) {
    for (const player of gameState.players) {
        const index = player.floorLine.findIndex(tile => tile.colourId === -1);
        if (index < 0) {
            gameState.centerOfTable.push(...player.floorLine.splice(index, 1));
            return;
        }
    }
}

export function dealTilesToFactoryDisplays(gameState) {
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

export function scoreRound(gameState) {
    let isGameOver = false;
    const roundScores = gameState.players.map((player) => {
        const playerScores = countPlayerScores(gameState, player);
        if (playerScores.length) {
            gameState.emit('player-scores', { player, playerScores });
        }
        if (!isGameOver) {
            isGameOver = playerScores.some(scores => scores.rowCompleted);
        }
        return playerScores;
    });

    if (isGameOver) {
        const winners = determineWinners(gameState, roundScores);
        gameState.emit('game-over', { winners });
    }
    else {
        prepareNextRound(gameState);
    }

    return roundScores;
}

function prepareNextRound(gameState) {
    gameState.currentPlayerIndex = gameState.nextRoundStartingPlayerIndex;
    dealTilesToFactoryDisplays(gameState);
}

function determineWinners(gameState, finalRoundScores) {
    let winners = [gameState.players[0]];

    for (let i = 1; i < gameState.players.length; i++) {
        const player = gameState.players[i];
        if (player.score > winners[0].score) {
            winners = [player];
            continue;
        }

        if (player.score === winners[0].score) {
            const playerCompletedRows = finalRoundScores[player.index]
                .reduce((rowsCompleted, scores) => rowsCompleted + (scores.rowCompleted ? 1 : 0), 0);
            const winnerCompletedRows = finalRoundScores[winners[0].index]
                .reduce((rowsCompleted, scores) => rowsCompleted + (scores.rowCompleted ? 1 : 0), 0);
            if (winnerCompletedRows > playerCompletedRows) {
                continue;
            }

            if (playerCompletedRows === winnerCompletedRows) {
                winners.push(player);
                continue;
            }

            winners = [player];
        }
    }

    return winners;
}

export function countPlayerScores(gameState, player) {
    const playerScores = [];
    for (let y = 0; y < player.patternLines.length; y++) {
        const line = player.patternLines[y];
        const colour = line.at(-1);
        if (colour === null) {
            continue;
        }

        const x = getXPositionForColourOnLine(gameState, y, colour);
        player.wall[x][y] = colour;
        const scores = scoreNewTile(gameState, player, colour, x, y);
        player.score += scores.rowScore + scores.columnScore + scores.colourScore;
        line[0] = null;
        const tilesToDiscard = line.filter(e => e !== null);
        gameState.discardedTiles = gameState.discardedTiles.concat(tilesToDiscard);
        gameState.emit('tiles-discarded', { player, tiles: tilesToDiscard, patternLineIndex: y, discardedTiles: structuredClone(gameState.discardedTiles) });
        for (let i = 1; i < line.length; i++) {
            line[i] = null;
        }
        scores.patternLineIndex = y;
        scores.discardedTiles = tilesToDiscard;
        playerScores.push(scores);
    }

    const floorLinePoints = player.floorLine.reduce(
        (acc, value, i) => acc + gameState.rules.floorLinePenalties[i], 0
    );
    if (floorLinePoints) {
        player.score += floorLinePoints;
        playerScores.push({ floorLinePoints, patternLineIndex: -1 });
        const tiles = player.floorLine.filter(colour => colour !== -1);
        gameState.discardedTiles = gameState.discardedTiles.concat(tiles);
        const startTile = player.floorLine.find(tile => tile.colourId === -1);
        player.floorLine = [];
        if (startTile) {
            gameState.centerOfTable = [startTile];
            gameState.emit('start-tile-returned', { player, centerOfTable: gameState.centerOfTable, patternLineIndex: -1, discardedTiles: [-1] });
        }
        if (tiles.length) {
            gameState.emit('tiles-discarded', { player, tiles, patternLineIndex: -1, discardedTiles: gameState.discardedTiles });
        }
        player.floorLine = [];
    }
    return playerScores;
}

function countTile(isScored, tile, isReached) {
    if (isScored) {
        return [0, true];
    }

    if (tile === null) {
        if (!isReached) {
            return [-1, false];
        }
        else {
            return [0, true];
        }
    }

    return [1, false];
}

function scoreNewTile(gameState, player, colour, x, y) {
    const { numberOfColours } = gameState.rules;
    let rowScore = 0, columnScore = 0, colourScore = 0;
    let rowScored = false, columnScored = false;
    for (let i = 0; i < numberOfColours; i++) {
        const [rowTileScore, finishedScoringRow] = countTile(rowScored, player.wall[x][i], i >= y);
        rowScore = rowTileScore === -1 ? 0 : rowScore + rowTileScore;
        rowScored = finishedScoringRow;
        const [columnTileScore, finishedScoringColumn] = countTile(columnScored, player.wall[i][y], i >= x);
        columnScore = columnTileScore === -1 ? 0 : columnScore + columnTileScore;
        columnScored = finishedScoringColumn;
        const colourX = getXPositionForColourOnLine(gameState, i, colour);
        if (player.wall[colourX][i]) {
            colourScore++;
        }
    }
    const rowCompleted = rowScore === numberOfColours;
    rowScore += rowCompleted ? 2 : 0;
    if (columnScore === 1) {
        columnScore = 0;
    }
    else if (columnScore === numberOfColours) {
        columnScore += 7;
    }
    colourScore = colourScore === numberOfColours ? 10 : 0;
    return { rowScore, columnScore, colourScore, rowCompleted };
}

export function fillTileBag(gameState) {
    const { rules } = gameState;
    for (let colourId = 0; colourId < rules.numberOfColours; colourId++) {
        for (let j = 0; j < rules.tilesPerColour; j++) {
            gameState.tileBag.push(createTile(gameState.tileBag.length + 1, colourId));
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
