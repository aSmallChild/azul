import { getRemainingColourIdsForLine, hasColour, isFull } from './util/line.js';

export default function rngBot(gameState) {
    // without favouring any row or colour find a valid move
    const player = gameState.players[gameState.currentPlayerIndex];
    const yIndexes = shuffle(Array.from(player.patternLines.keys()));
    const colourIds = shuffle(yIndexes.slice(0));
    const displayIds = Array.from(gameState.factoryDisplays.keys());
    displayIds.push(-1);
    shuffle(displayIds);

    for (const yIndex of yIndexes) {
        const patternLine = player.patternLines[yIndex];
        if (isFull(patternLine)) {
            continue;
        }

        const remainingColourIdsForRow = getRemainingColourIdsForLine(player, yIndex, colourIds);
        for (const colourId of remainingColourIdsForRow) {
            // find a display with that colour
            for (const displayId of displayIds) {
                const display = gameState.factoryDisplays?.[displayId] ?? gameState.centerOfTable;
                if (!display?.[0]) {
                    continue;
                }
                if (hasColour(display, colourId)) {
                    return { displayId, colourId, lineId: yIndex };
                }
            }

        }
    }

    // draw the first colour it finds into the floor line
    for (const displayId of displayIds) {
        const display = gameState.factoryDisplays?.[displayId] ?? gameState.centerOfTable;
        if (!display?.[0]) {
            continue;
        }
        const randomTile = display[Math.floor(Math.random() * display.length)];
        if (randomTile?.colourId !== -1) {
            return { displayId, colourId: randomTile.colourId, lineId: -1 };
        }

        const tile = display[0].colourId !== -1 ? display[0] : display[1];
        if (!tile) {
            continue;
        }
        return { displayId, colourId: tile.colourId, lineId: -1 };
    }

    return null;
}

function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}
