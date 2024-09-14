import { createTile } from './tile.js';

export function createPlayer(params) {
    return {
        index: -1,
        name: params?.name ?? 'UNNAMED PLAYER',
        score: 0,
        patternLines: [],
        wall: [],
        floorLine: [],
    };
}

export function createGameRules() {
    const numberOfColours = 5;
    return {
        numberOfColours,
        tilesPerColour: numberOfColours * 4,
        tilesPerFactoryDisplay: 4,
        floorLinePenalties: [-1, -1, -2, -2, -2, -3, -3],
        rowPoints: 2,
        columnPoints: 7,
        colourPoints: 10,
        firstPickFromCentre: -1,
    };
}

export function createGameState(params = {}) {
    const {
        rules = createGameRules(),
        emit = null
    } = params;

    return {
        rules,
        players: [],
        currentPlayerIndex: 0,
        nextRoundStartingPlayerIndex: null,
        factoryDisplays: [[]],
        centerOfTable: [createTile(1, -1)],
        tileBag: [],
        discardedTiles: [],
        roundIndex: 0,
        emit,
    };
}

export function stateAsSeenByPlayer(gameState) {
    const { tileBag, ...state } = gameState;
    for (const key of Object.keys(state)) {
        if (state[key]?.constructor === Function) {
            delete state[key];
        }
    }
    return structuredClone(state);
}
