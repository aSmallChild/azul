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
        const remainingColourIdsForRow = patternLine[0]?.colourId
            ? [patternLine[0]?.colourId]
            : colourIds.filter(colourId => {
                if (player.wall[yIndex][getXPositionForColourOnLine(yIndex, colourId)]) {
                    return false;
                }
                return player.patternLines.every((patternLine, index) => {
                    // todo there is an issue here with this filter
                    if (index === yIndex) {
                        return true;
                    }
                    const [firstTile] = patternLine;
                    if (!firstTile) {
                        return true;
                    }
                    return !patternLine.at(-1) || firstTile.colourId !== colourId;
                });
            });
        for (const colourId of remainingColourIdsForRow) {
            // find a display with that colour
            // todo { success: false, message: "There is already a tile of a different colour in that pattern line." }
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

function getColourForWallPosition(x, y, numberOfColours = 5) {
    return y >= x ? y - x : numberOfColours + y - x;
}

function getXPositionForColourOnLine(y, colourId, numberOfColours = 5) {
    return (y + colourId) % numberOfColours;
}

function hasTiles(line) {
    return line.some(tile => tile);
}

function isFull(line) {
    return !line.some(tile => !tile);
}

function hasColour(line, colourId) {
    return line.find(tile => tile?.colourId === colourId);
}
