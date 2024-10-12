import { getRemainingColourIdsForLine, hasColour, isFull } from './util/line.js';

export default function getPossibleMoves(gameState) {
    const player = gameState.players[gameState.currentPlayerIndex];
    const yIndexes = Array.from(player.patternLines.keys());
    const colourIds = yIndexes.slice(0);
    const displayIds = Array.from(gameState.factoryDisplays.keys());
    displayIds.push(-1);

    const moves = [];
    for (const yIndex of yIndexes) {
        const patternLine = player.patternLines[yIndex];
        if (isFull(patternLine)) {
            continue;
        }

        const remainingColourIdsForRow = getRemainingColourIdsForLine(player, yIndex, colourIds);
        for (const colourId of remainingColourIdsForRow) {
            for (const displayId of displayIds) {
                const display = displayId >= 0 ? gameState.factoryDisplays[displayId] : gameState.centerOfTable;
                if (!display[0]) {
                    continue;
                }
                if (hasColour(display, colourId)) {
                    moves.push({ displayId, colourId, lineId: yIndex });
                }
            }

        }
    }

    for (const displayId of displayIds) {
        const display = displayId >= 0 ? gameState.factoryDisplays[displayId] : gameState.centerOfTable;
        if (!display[0]) {
            continue;
        }
        const displayColourIds = new Set();
        display.forEach(tile => {
            if (tile.colourId < 0 || displayColourIds.has(tile.colourId)) {
                return;
            }
            displayColourIds.add(tile.colourId);
            moves.push({ displayId, colourId: tile.colourId, lineId: -1 });
        });
    }

    return moves;
}
