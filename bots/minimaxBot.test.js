import minimaxBot, { testExports } from './minimaxBot.js';
import { describe, test } from 'node:test'
import assert from 'node:assert'

const rules = { 'numberOfColours': 5, 'tilesPerColour': 20, 'tilesPerFactoryDisplay': 4, 'floorLinePenalties': [-1, -1, -2, -2, -2, -3, -3], 'rowPoints': 2, 'columnPoints': 7, 'colourPoints': 10, 'firstPickFromCentre': -1 };
const state1 = {
    rules,
    'players': [{
        'index': 0, 'name': 'PLAYER ONE', 'score': 0,
        'patternLines': [[null], [null, null], [null, null, null], [null, null, null, null], [null, null, null, null, null]],
        'wall': [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]],
        'floorLine': []
    }, {
        'index': 1, 'name': 'PLAYER 2', 'score': 0,
        'patternLines': [[null], [null, null], [null, null, null], [null, null, null, null], [null, null, null, null, null]],
        'wall': [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]],
        'floorLine': []
    }],
    'currentPlayerIndex': 0,
    'nextRoundStartingPlayerIndex': null,
    'factoryDisplays': [
        [{ 'id': 10, 'colourId': 0 }, { 'id': 24, 'colourId': 1 }, { 'id': 26, 'colourId': 1 }, { 'id': 40, 'colourId': 1 }],
        [{ 'id': 12, 'colourId': 0 }, { 'id': 34, 'colourId': 1 }, { 'id': 20, 'colourId': 0 }, { 'id': 89, 'colourId': 4 }],
        [{ 'id': 79, 'colourId': 3 }, { 'id': 92, 'colourId': 4 }, { 'id': 30, 'colourId': 1 }, { 'id': 2, 'colourId': 0 }],
        [{ 'id': 83, 'colourId': 4 }, { 'id': 87, 'colourId': 4 }, { 'id': 100, 'colourId': 4 }, { 'id': 51, 'colourId': 2 }],
        [{ 'id': 50, 'colourId': 2 }, { 'id': 85, 'colourId': 4 }, { 'id': 8, 'colourId': 0 }, { 'id': 84, 'colourId': 4 }]
    ],
    'centerOfTable': [{ 'id': 1, 'colourId': -1 }],
    'tileBag': [
        { 'id': 86, 'colourId': 4 }, { 'id': 21, 'colourId': 1 }, { 'id': 90, 'colourId': 4 }, { 'id': 94, 'colourId': 4 }, { 'id': 78, 'colourId': 3 }, { 'id': 61, 'colourId': 3 },
        { 'id': 60, 'colourId': 2 }, { 'id': 56, 'colourId': 2 }, { 'id': 93, 'colourId': 4 }, { 'id': 18, 'colourId': 0 }, { 'id': 75, 'colourId': 3 }, { 'id': 91, 'colourId': 4 },
        { 'id': 27, 'colourId': 1 }, { 'id': 37, 'colourId': 1 }, { 'id': 15, 'colourId': 0 }, { 'id': 42, 'colourId': 2 }, { 'id': 9, 'colourId': 0 }, { 'id': 88, 'colourId': 4 },
        { 'id': 22, 'colourId': 1 }, { 'id': 4, 'colourId': 0 }, { 'id': 63, 'colourId': 3 }, { 'id': 28, 'colourId': 1 }, { 'id': 58, 'colourId': 2 }, { 'id': 66, 'colourId': 3 },
        { 'id': 64, 'colourId': 3 }, { 'id': 97, 'colourId': 4 }, { 'id': 47, 'colourId': 2 }, { 'id': 68, 'colourId': 3 }, { 'id': 29, 'colourId': 1 }, { 'id': 13, 'colourId': 0 },
        { 'id': 80, 'colourId': 3 }, { 'id': 65, 'colourId': 3 }, { 'id': 69, 'colourId': 3 }, { 'id': 49, 'colourId': 2 }, { 'id': 38, 'colourId': 1 }, { 'id': 11, 'colourId': 0 },
        { 'id': 19, 'colourId': 0 }, { 'id': 48, 'colourId': 2 }, { 'id': 16, 'colourId': 0 }, { 'id': 82, 'colourId': 4 }, { 'id': 98, 'colourId': 4 }, { 'id': 41, 'colourId': 2 },
        { 'id': 6, 'colourId': 0 }, { 'id': 44, 'colourId': 2 }, { 'id': 1, 'colourId': 0 }, { 'id': 32, 'colourId': 1 }, { 'id': 36, 'colourId': 1 }, { 'id': 31, 'colourId': 1 },
        { 'id': 55, 'colourId': 2 }, { 'id': 67, 'colourId': 3 }, { 'id': 71, 'colourId': 3 }, { 'id': 81, 'colourId': 4 }, { 'id': 99, 'colourId': 4 }, { 'id': 72, 'colourId': 3 },
        { 'id': 17, 'colourId': 0 }, { 'id': 39, 'colourId': 1 }, { 'id': 7, 'colourId': 0 }, { 'id': 23, 'colourId': 1 }, { 'id': 3, 'colourId': 0 }, { 'id': 77, 'colourId': 3 },
        { 'id': 57, 'colourId': 2 }, { 'id': 33, 'colourId': 1 }, { 'id': 53, 'colourId': 2 }, { 'id': 73, 'colourId': 3 }, { 'id': 43, 'colourId': 2 }, { 'id': 14, 'colourId': 0 },
        { 'id': 52, 'colourId': 2 }, { 'id': 76, 'colourId': 3 }, { 'id': 54, 'colourId': 2 }, { 'id': 35, 'colourId': 1 }, { 'id': 95, 'colourId': 4 }, { 'id': 45, 'colourId': 2 },
        { 'id': 70, 'colourId': 3 }, { 'id': 74, 'colourId': 3 }, { 'id': 25, 'colourId': 1 }, { 'id': 5, 'colourId': 0 }, { 'id': 59, 'colourId': 2 }, { 'id': 62, 'colourId': 3 },
        { 'id': 46, 'colourId': 2 }, { 'id': 96, 'colourId': 4 }
    ],
    'discardedTiles': [],
    'roundNumber': 1
};
const state2 = {
    rules,
    'players': [{
        'index': 0, 'name': 'PLAYER ONE', 'score': 0,
        'patternLines': [[null], [null, null], [null, null, null], [null, null, null, null], [null, null, null, null, null]],
        'wall': [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]],
        'floorLine': []
    }, {
        'index': 1, 'name': 'PLAYER 2', 'score': 0,
        'patternLines': [[null], [null, null], [null, null, null], [null, null, null, null], [null, null, null, null, null]],
        'wall': [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]],
        'floorLine': []
    }],
    'currentPlayerIndex': 0,
    'nextRoundStartingPlayerIndex': null,
    'factoryDisplays': [],
    'centerOfTable': [{ 'id': 1, 'colourId': -1 }],
    'tileBag': [
        { 'id': 46, 'colourId': 2 }, { 'id': 96, 'colourId': 4 }
    ],
    'discardedTiles': [],
    'roundNumber': 1
};

const moves = [
    {
        'move': { 'displayId': 1, 'colourId': 2, 'lineId': 0 },
        'previousNode': null,
        'roundScores': [
            [
                { 'rowScore': 1, 'columnScore': 0, 'colourScore': 0, 'rowCompleted': false, 'patternLineIndex': 0, 'discardedTiles': [] },
                { 'floorLinePoints': -1, 'patternLineIndex': -1 }
            ],
            []
        ],
        playerScoreDelta: [0, 0],
        'winnerIds': [0, 1],
        'isGameOver': false,
        'isNewRound': false,
        'state': {
            'rules': rules,
            'players': [{
                'index': 0, 'name': 'PLAYER ONE', 'score': 0,
                'patternLines': [[{ 'id': 79, 'colourId': 2 }], [null, null], [null, null, null], [null, null, null, null], [null, null, null, null, null]],
                'wall': [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]],
                'floorLine': [{ 'id': 92, 'colourId': 2 }]
            }, {
                'index': 1, 'name': 'PLAYER 2', 'score': 0,
                'patternLines': [[null], [null, null], [null, null, null], [null, null, null, null], [null, null, null, null, null]],
                'wall': [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]],
                'floorLine': []
            }],
            'currentPlayerIndex': 1,
            'nextRoundStartingPlayerIndex': null,
            'factoryDisplays': [[{ 'id': 12, 'colourId': 3 }], []],
            'centerOfTable': [{ 'id': 1, 'colourId': -1 }],
            'tileBag': [{ 'id': 46, 'colourId': 2 }, { 'id': 96, 'colourId': 4 }],
            'discardedTiles': [],
            'roundNumber': 1
        },
        'previousState': state2,
        'nextMoves': null,
        'depth': 1
    },
    {
        'move': {
            'displayId': 1, 'colourId': 2, 'lineId': 1
        },
        'previousNode': null,
        'roundScores': [
            [{ 'rowScore': 1, 'columnScore': 0, 'colourScore': 0, 'rowCompleted': false, 'patternLineIndex': 1, 'discardedTiles': [{ 'id': 92, 'colourId': 2 }] }],
            []
        ],
        playerScoreDelta: [1, 0],
        'winnerIds': [0],
        'isGameOver': false,
        'isNewRound': false,
        'state': {
            'rules': rules,
            'players': [
                {
                    'index': 0,
                    'name': 'PLAYER ONE',
                    'score': 0,
                    'patternLines': [[null], [{ 'id': 79, 'colourId': 2 }, { 'id': 92, 'colourId': 2 }], [null, null, null], [null, null, null, null], [null, null, null, null, null]],
                    'wall': [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]],
                    'floorLine': []
                },
                {
                    'index': 1,
                    'name': 'PLAYER 2',
                    'score': 0,
                    'patternLines': [[null], [null, null], [null, null, null], [null, null, null, null], [null, null, null, null, null]],
                    'wall': [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]],
                    'floorLine': []
                }
            ],
            'currentPlayerIndex': 1,
            'nextRoundStartingPlayerIndex': null,
            'factoryDisplays': [[{ 'id': 12, 'colourId': 3 }], []],
            'centerOfTable': [{ 'id': 1, 'colourId': -1 }],
            'tileBag': [{ 'id': 46, 'colourId': 2 }, { 'id': 96, 'colourId': 4 }],
            'discardedTiles': [],
            'roundNumber': 1
        },
        'previousState': state2,
        'nextMoves': null,
        'depth': 1
    },
    {
        'move': {
            'displayId': 0,
            'colourId': 3,
            'lineId': 1
        },
        'previousNode': null,
        'roundScores': [
            [],
            []
        ],
        playerScoreDelta: [0, 0],
        'winnerIds': [
            0,
            1
        ],
        'isGameOver': false,
        'isNewRound': false,
        'state': {
            'rules': rules,
            'players': [
                {
                    'index': 0,
                    'name': 'PLAYER ONE',
                    'score': 0,
                    'patternLines': [[null], [{ 'id': 12, 'colourId': 3 }, null], [null, null, null], [null, null, null, null], [null, null, null, null, null]],
                    'wall': [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]],
                    'floorLine': []
                },
                {
                    'index': 1,
                    'name': 'PLAYER 2',
                    'score': 0,
                    'patternLines': [[null], [null, null], [null, null, null], [null, null, null, null], [null, null, null, null, null]],
                    'wall': [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]],
                    'floorLine': []
                }
            ],
            'currentPlayerIndex': 1,
            'nextRoundStartingPlayerIndex': null,
            'factoryDisplays': [[], [{ 'id': 79, 'colourId': 2 }, { 'id': 92, 'colourId': 2 }]],
            'centerOfTable': [{ 'id': 1, 'colourId': -1 }],
            'tileBag': [{ 'id': 46, 'colourId': 2 }, { 'id': 96, 'colourId': 4 }],
            'discardedTiles': [],
            'roundNumber': 1
        },
        'previousState': state2,
        'nextMoves': null,
        'depth': 1
    },
]

describe('minimaxBot', () => {
    test('prefers move that draw the most tiles', async () => {
        state2.factoryDisplays = [
            [{ 'id': 12, 'colourId': 3 },],
            [{ 'id': 79, 'colourId': 2 }, { 'id': 92, 'colourId': 2 }],
        ];
        const move = await minimaxBot(state2, 1, 1);
        assert.strictEqual(move.displayId, 1, 'Picked the wrong display.');
        assert.strictEqual(move.colourId, 2, 'Picked the wrong colour.');
        assert.strictEqual(move.lineId, 1, 'Picked the wrong line.');
    });
    test('draws 5 tiles when it can fit them into the 5 line', async () => {
        state2.factoryDisplays = [
            [{ 'id': 12, 'colourId': 1 },],
            [{ 'id': 79, 'colourId': 2 }, { 'id': 93, 'colourId': 2 }, { 'id': 94, 'colourId': 2 }, { 'id': 95, 'colourId': 2 }, { 'id': 96, 'colourId': 2 }],
        ];
        const move = await minimaxBot(state2, 1, 1);
        const msg = JSON.stringify(move);
        assert.strictEqual(move.displayId, 1, `Picked the wrong display. ${msg}`);
        assert.strictEqual(move.colourId, 2, `Picked the wrong colour. ${msg}`);
        assert.strictEqual(move.lineId, 4, `Picked the wrong line. ${msg}`);
    });
    test('fits tiles into the correct line', async () => {
        state2.factoryDisplays = [
            [{ 'id': 79, 'colourId': 2 }, { 'id': 93, 'colourId': 2 }, { 'id': 94, 'colourId': 2 }, { 'id': 95, 'colourId': 2 }, { 'id': 96, 'colourId': 2 }],
        ];
        const move = await minimaxBot(state2, 1, 1);
        assert.strictEqual(move.displayId, 0, 'Picked the wrong display.');
        assert.strictEqual(move.colourId, 2, 'Picked the wrong colour.');
        assert.strictEqual(move.lineId, 4, 'Picked the wrong line.');
    });
    test('picks optimal line to place tiles in', async () => {
        state2.factoryDisplays = [
            [{ 'id': 12, 'colourId': 0 },],
            [{ 'id': 79, 'colourId': 2 }, { 'id': 92, 'colourId': 2 }],
        ];
        const move = await minimaxBot(state2, 1, 1);
        assert.strictEqual(move.displayId, 1, 'Picked the wrong display.');
        assert.strictEqual(move.colourId, 2, 'Picked the wrong colour.');
        assert.strictEqual(move.lineId, 1, 'Picked the wrong line.');
    });
    //
    // test('progress toward row completion', () => {
    //     const result = completedRowChecks({
    //         move: { displayId: 1, colourId: 0, lineId: 0 },
    //         previousState: state1
    //     }, {
    //         move: { displayId: 2, colourId: 1, lineId: 2 },
    //         previousState: state1
    //     });
    //
    //     assert.equal(result, true, 'a should not be before b, result should be positive');
    //     assert.equal(result > 0, true, 'a should not be before b, result should be positive');
    // });
});



