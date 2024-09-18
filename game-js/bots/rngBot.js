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

        // try to find tiles that will be accepted in that line, else go to the next pattern line
        const remainingColourIdsForRow = patternLine[0]
            ? [patternLine[0].colourId]
            : colourIds.filter(colourId => {
                // wall slot for this colour is already occupied
                if (player.wall[yIndex][getXPositionForColourOnLine(yIndex, colourId)]) {
                    return false;
                }
                // other lines with this colour are complete
                return player.patternLines.every((patternLine, index) => {
                    return index === yIndex // skip checking the current line, we already know it's empty
                        || patternLine.at(-1) // other line is full and doesn't restrict what we do on the current line
                        || patternLine[0]?.colourId !== colourId; // either there are no tiles in the line or there are but they're a different colour
                });
            });
        for (const colourId of remainingColourIdsForRow) {
            // find a display with that colour
            for (const displayId of displayIds) {
                const display = gameState.factoryDisplays?.[displayId] ?? gameState.centerOfTable;
                if (!display?.[0]) {
                    continue;
                }
                if (hasColour(display, colourId)) {
                    return { lineId: yIndex, colourId, displayId };
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
            return { lineId: -1, colourId: randomTile.colourId, displayId };
        }

        const tile = display[0].colourId !== -1 ? display[0] : display[1];
        if (!tile) {
            continue;
        }
        return { lineId: -1, colourId: tile.colourId, displayId };
    }

    throw new Error('could not find a move to make!!');
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

function getXPositionForColourOnLine(y, colourId, numberOfColours = 5) {
    return (y + colourId) % numberOfColours;
}

function isFull(line) {
    return !line.some(tile => !tile);
}

function hasColour(line, colourId) {
    return line.find(tile => tile?.colourId === colourId);
}
