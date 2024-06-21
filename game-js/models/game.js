export function createPlayer() {
    return {
        name: '',
        score: 0,
        factory: [],
        patternLines: [],
        wall: [],
        floorLine: [],
    }
}

export function createGameRules() {
    const colours = [1, 2, 3, 4, 5];
    return {
        colours,
        tilesPerColour: colours.length * 4,
        floorLinePenalties: [-1, -1, -2, -2, -2, -3, -3],
        rowPoints: 2,
        columnPoints: 7,
        colourPoints: 10,
        firstPickFromCentre: -1,
    }
}

export function createGameState() {
    return {
        players: [],
        currentPlayerIndex: null,
        factoryTiles: [],
        centerOfTable: [],
    }
}
