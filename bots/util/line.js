export function getXPositionForColourOnLine(y, colourId, numberOfColours = 5) {
    return (y + colourId) % numberOfColours;
}

export function countDisplayTiles(display, colourId) {
    let count = 0;
    for (const tile of display) {
        if (tile?.colourId !== colourId) {
            continue;
        }
        count++;
    }
    return count;
}

export function countLineTiles(line) {
    let count = 0;
    for (const tile of line) {
        if (!tile) {
            break;
        }
        count++;
    }
    return count;
}

export function isFull(line) {
    return !line.some(tile => !tile);
}

export function hasColour(line, colourId) {
    return line.find(tile => tile?.colourId === colourId);
}

export function getRemainingColourIdsForLine(player, lineIndex, colourIds) {
    const patternLine = player.patternLines[lineIndex];
    if (patternLine[0]) {
        return [patternLine[0].colourId];
    }
    return colourIds.filter(colourId => {
        // wall slot for this colour is already occupied
        if (player.wall[lineIndex][getXPositionForColourOnLine(lineIndex, colourId)]) {
            return false;
        }
        // other lines with this colour are complete
        return player.patternLines.every((patternLine, index) => {
            return index === lineIndex // skip checking the current line, we already know it's empty
                || patternLine.at(-1) // other line is full and doesn't restrict what we do on the current line
                || patternLine[0]?.colourId !== colourId; // either there are no tiles in the line or there are but they're a different colour
        });
    });
}
