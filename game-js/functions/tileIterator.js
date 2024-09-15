export default function* tileIterator(gameState) {
    for (const line of parentArrayIterator(gameState)) {
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

function* parentArrayIterator(gameState) {
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
    for (const line of parentArrayIterator(gameState)) {
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
