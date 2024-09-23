export default function* tileIterator(gameState) {
    for (const line of tileListIterator(gameState)) {
        yield* lineIterator(line);
    }
}

function* lineIterator(line) {
    for (const tile of line) {
        if (tile) {
            yield tile;
        }
    }
}

export function* tileListIterator(gameState) {
    for (const player of gameState.players) {
        for (const line of player.patternLines) {
            yield line;
        }
        for (const line of player.wall) {
            yield line;
        }
        yield player.floorLine;
    }

    for (const line of gameState.factoryDisplays) {
        yield line;
    }

    yield gameState.centerOfTable;
    yield gameState.discardedTiles;
    yield gameState.tileBag;
}

export function transformTiles(gameState, callback) {
    for (const line of tileListIterator(gameState)) {
        mapLine(line, callback);
    }
}

function mapLine(tiles, callback) {
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i]) {
            tiles[i] = callback(tiles[i]);
        }
    }
}
