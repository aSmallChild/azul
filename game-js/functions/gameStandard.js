import { createTile } from '../models/tile.js';
import shuffle from '../util/shuffle.js';

function setNextPlayer(gameState) {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
}

export function startGame(gameState) {
    gameState.factoryDisplays.push([]);
    gameState.centerOfTable.push(createTile(1, -1));
    fillTileBag(gameState);
    dealTilesToFactoryDisplays(gameState);
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
    return player;
}

export function canDrawTiles(gameState, displayId, colourId, patternLineId, playerId = gameState.currentPlayerIndex) {
    const player = gameState.players[playerId];

    const isTurnResult = isPlayerTurn(gameState, player);
    if (!isTurnResult.success) {
        return isTurnResult;
    }

    if (displayId >= gameState.factoryDisplays.length) {
        return {
            success: false,
            message: 'Cannot draw tiles, invalid display specified.'
        };
    }

    if (patternLineId >= player.patternLines.length) {
        return {
            success: false,
            message: 'Cannot draw tiles, invalid pattern line specified.'
        };
    }

    const display = displayId < 0 ? gameState.centerOfTable : gameState.factoryDisplays[displayId];
    const { tiles = null, ...drawResult } = canDrawFromLocation(display, colourId, displayId < 0 ? 'the center of the table' : 'that factory display');
    if (!drawResult.success) {
        return drawResult;
    }

    if (patternLineId >= 0) {
        const placementResult = canPlaceTileInPatternLine(gameState, player, colourId, patternLineId);
        if (!placementResult.success) {
            return placementResult;
        }
    }

    return { success: true, tiles };
}

export function drawTiles(gameState, displayId, colourId, patternLineIndex, playerId = gameState.currentPlayerIndex) {
    const canDrawResult = canDrawTiles(gameState, displayId, colourId, patternLineIndex, playerId);
    if (!canDrawResult.success) {
        return canDrawResult;
    }

    const player = gameState.players[playerId];
    const display = displayId < 0 ? gameState.centerOfTable : gameState.factoryDisplays[displayId];
    const remainingTiles = display.filter(tile => tile.colourId !== colourId);
    const startTile = remainingTiles[0]?.colourId === -1 ? remainingTiles.splice(0, 1) : null;
    if (startTile) {
        addTilesToFloorLine(gameState, player, startTile);
        gameState.nextRoundStartingPlayerIndex = player.index;
    }
    if (displayId < 0) {
        gameState.centerOfTable = remainingTiles;
    }
    else {
        gameState.centerOfTable.push(...remainingTiles);
        display.splice(0, display.length);
    }

    if (patternLineIndex < 0) {
        addTilesToFloorLine(gameState, player, canDrawResult.tiles);
    }
    else {
        addTilesToPatternLine(gameState, player, player.patternLines[patternLineIndex], canDrawResult.tiles);
    }

    return prepareNextTurn(gameState);
}

function isPlayerTurn(gameState, player) {
    if (player.index !== gameState.currentPlayerIndex) {
        return {
            success: false,
            message: `It's not your turn.`
        };
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
    if (player.wall[patternLineIndex][x] !== null) {
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
            message: 'There is already a tile of a different colour in that pattern line.'
        };
    }

    const otherSameColourLinesAreComplete = player.patternLines.every((patternLine, index) => {
        if (index === patternLineIndex) {
            return true;
        }
        const [firstTile] = patternLine;
        if (!firstTile) {
            return true;
        }
        return patternLine.at(-1) || firstTile.colourId !== colourId;
    });

    if (!otherSameColourLinesAreComplete) {
        return {
            success: false,
            message: 'There is another pattern line with that colour that is incomplete.'
        };
    }

    return { success: true };
}

export function getColourForWallPosition(gameState, x, y) {
    return y >= x ? y - x : gameState.rules.numberOfColours + y - x;
}

function getXPositionForColourOnLine(gameState, y, colourId) {
    return (y + colourId) % gameState.rules.numberOfColours;
}

export function addTilesToPatternLine(gameState, player, patternLine, tiles) {
    const startIndex = patternLine.indexOf(null);
    const remainingSpaces = patternLine.length - startIndex;
    const numberOfTilesToAdd = Math.min(tiles.length, remainingSpaces);
    for (let i = 0; i < numberOfTilesToAdd; i++) {
        patternLine[i + startIndex] = tiles.shift();
    }
    addTilesToFloorLine(gameState, player, tiles);
}

export function addTilesToFloorLine(gameState, player, tiles) {
    const numberOfTilesToAdd = gameState.rules.floorLinePenalties.length - player.floorLine.length;
    player.floorLine = player.floorLine.concat(tiles.slice(0, numberOfTilesToAdd));
    gameState.discardedTiles = gameState.discardedTiles.concat(tiles.slice(numberOfTilesToAdd));
}

export function dealTilesToFactoryDisplays(gameState) {
    shuffle(gameState.tileBag);
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
    let isGameOver = false, winners = null;
    const roundScores = gameState.players.map((player) => {
        const playerScores = countPlayerScores(gameState, player);
        if (!isGameOver) {
            isGameOver = playerScores.some(scores => scores.rowCompleted);
        }
        return playerScores;
    });

    if (isGameOver) {
        winners = determineWinners(gameState, roundScores);
    }
    else {
        gameState.roundNumber++;
        gameState.currentPlayerIndex = gameState.nextRoundStartingPlayerIndex;
        dealTilesToFactoryDisplays(gameState);
    }

    return { success: true, isGameOver, roundScores, winners };
}

export function determineWinners(gameState, finalRoundScores) {
    let winners = [gameState.players[0]];

    for (let i = 1; i < gameState.players.length; i++) {
        const player = gameState.players[i];
        if (player.score > winners[0].score) {
            winners = [player];
            continue;
        }

        if (player.score < winners[0].score) {
            continue;
        }

        const playerCompletedRows = finalRoundScores[player.index]
            .reduce((rowsCompleted, scores) => rowsCompleted + (scores.rowCompleted ? 1 : 0), 0);
        const winnerCompletedRows = finalRoundScores[winners[0].index]
            .reduce((rowsCompleted, scores) => rowsCompleted + (scores.rowCompleted ? 1 : 0), 0);
        if (winnerCompletedRows < playerCompletedRows) {
            winners = [player];
            continue;
        }

        if (playerCompletedRows === winnerCompletedRows) {
            winners.push(player);
        }
    }

    return winners;
}

export function countPlayerScores(gameState, player) {
    const playerScores = [];
    for (let y = 0; y < player.patternLines.length; y++) {
        const line = player.patternLines[y];
        const lastTile = line.at(-1) ?? null;
        if (lastTile === null) {
            continue;
        }

        const x = getXPositionForColourOnLine(gameState, y, lastTile.colourId);
        player.wall[y][x] = line[0];
        const scores = scoreNewTile(gameState, player, lastTile, x, y);
        player.score += scores.rowScore + scores.columnScore + scores.colourScore;
        const tilesToDiscard = line.slice(1);
        gameState.discardedTiles = gameState.discardedTiles.concat(tilesToDiscard);
        for (let i = 0; i < line.length; i++) {
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
        const tiles = player.floorLine.filter(tile => {
            if (tile.colourId === -1) {
                gameState.centerOfTable = [tile];
                return false;
            }
            return true;
        });
        gameState.discardedTiles = gameState.discardedTiles.concat(tiles);
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

function scoreNewTile(gameState, player, tile, x, y) {
    const { numberOfColours } = gameState.rules;
    let rowScore = 0, columnScore = 0, colourScore = 0;
    let rowScored = false, columnScored = false;
    for (let i = 0; i < numberOfColours; i++) {
        const [rowTileScore, finishedScoringRow] = countTile(rowScored, player.wall[y][i], i >= x);
        rowScore = rowTileScore === -1 ? 0 : rowScore + rowTileScore;
        rowScored = finishedScoringRow;
        const [columnTileScore, finishedScoringColumn] = countTile(columnScored, player.wall[i][x], i >= y);
        columnScore = columnTileScore === -1 ? 0 : columnScore + columnTileScore;
        columnScored = finishedScoringColumn;
        const colourX = getXPositionForColourOnLine(gameState, i, tile.colourId);
        if (player.wall[i][colourX]) {
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
}

function refillTileBag(gameState) {
    gameState.tileBag = gameState.discardedTiles;
    gameState.discardedTiles = [];
}

function prepareNextTurn(gameState) {
    const isNewRound = !gameState.factoryDisplays.some(lineHasTiles)
        && !lineHasTiles(gameState.centerOfTable);
    if (!isNewRound) {
        setNextPlayer(gameState);
        return { success: true, isNewRound, isGameOver: false };
    }

    const result = scoreRound(gameState);
    if (result.isGameOver) {
        return result;
    }
    result.isNewRound = true;
    gameState.currentPlayerIndex = gameState.nextRoundStartingPlayerIndex;
    gameState.nextRoundStartingPlayerIndex = null;
    return result;
}

function lineHasTiles(line) {
    return line.some(tile => tile);
}
