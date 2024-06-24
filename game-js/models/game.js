export function createPlayer() {
    return {
        name: '',
        score: 0,
        patternLines: [],
        wall: [],
        floorLine: [],
    }
}

export function createGameRules() {
    const numberOfColours = 5;
    return {
        numberOfColours,
        tilesPerColour: numberOfColours * 4,
        floorLinePenalties: [-1, -1, -2, -2, -2, -3, -3],
        rowPoints: 2,
        columnPoints: 7,
        colourPoints: 10,
        firstPickFromCentre: -1,
    }
}

export function createGameState(rules = createGameRules()) {
    return {
        rules,
        players: [],
        currentPlayerIndex: null,
        factoryDisplays: [[]],
        centerOfTable: [-1],
        tileBag: [],
        discardedTiles: [],
    }
}
