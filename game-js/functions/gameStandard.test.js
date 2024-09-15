import { addPlayer, addTilesToFloorLine, dealTilesToFactoryDisplays, drawFromCenter, drawFromFactoryDisplay, fillTileBag, scoreRound } from './gameStandard.js';
import { createGameState, createPlayer } from '../models/game.js';
import Tile, { createTile } from '../models/tile.js';
import { expect } from 'chai';
import loadGame from './loadGame.js';

describe('Standard game tests', () => {
    describe('addPlayer', () => {
        let state, player;
        before(() => {
            state = createGameState();
            player = createPlayer();
            addPlayer(state, player);
        })

        it('should add player to game state', () => {
            expect(state.players.length).to.equal(1);
        });

        it('should have the correct wall size', () => {
            expect(player.wall.length).to.equal(5);
            player.wall.forEach(row => {
                expect(row.length).to.equal(5);
            });
        });

        it('should have the correct pattern line size', () => {
            expect(player.patternLines.length).to.equal(5);
            player.patternLines.forEach((row, y) => {
                expect(row.length).to.equal(y + 1);
            });
        });
    });

    describe('sample game', () => {
        let state;
        state = createGameState();
        const player1 = addPlayer(state, createPlayer());
        const player2 = addPlayer(state, createPlayer());
        state.factoryDisplays = [
            [createTile(11, 0), createTile(21, 0), createTile(31, 0), createTile(41, 1)],
            [createTile(12, 1), createTile(22, 2), createTile(32, 0), createTile(42, 1)],
            [createTile(13, 2), createTile(23, 1), createTile(33, 0), createTile(43, 3)],
            [createTile(14, 3), createTile(24, 3), createTile(34, 0), createTile(44, 2)],
            [createTile(15, 3), createTile(25, 3), createTile(35, 0), createTile(45, 2)],
        ];

        it('turn 1 - draw tiles from factory display', () => {
            const factoryDisplay = state.factoryDisplays[0];
            const result = drawFromFactoryDisplay(state, factoryDisplay, player1, 0, 2);
            expect(result.success, result.message).to.be.true;
            expect(factoryDisplay.length).to.equal(0);
            expect(player1.patternLines[0]).to.deep.equal([null]);
            expect(player1.patternLines[1]).to.deep.equal([null, null]);
            expect(player1.patternLines[2]).to.have.length(3);
            expect(player1.patternLines[2].every(tile => tile.colourId === 0), 'all tiles are the same colour').to.be.true;
            expect(player1.patternLines[3]).to.deep.equal([null, null, null, null]);
            expect(player1.patternLines[4]).to.deep.equal([null, null, null, null, null]);
            expect(player1.floorLine.length).to.equal(0);
            expect(state.centerOfTable[0].colourId).to.deep.equal(-1);
            expect(state.centerOfTable[1].colourId).to.deep.equal(1);
            expect(state.centerOfTable).to.have.length(2);
        });

        it('turn 2 - fails to draw tiles from same display', () => {
            const factoryDisplay = state.factoryDisplays[0];
            const result = drawFromFactoryDisplay(state, factoryDisplay, player1, 0, 2);
            expect(result.success).to.be.false;
        });

        it('turn 2 - fails to draw colour that is not in the display', () => {
            const factoryDisplay = state.factoryDisplays[1];
            const result = drawFromFactoryDisplay(state, factoryDisplay, player2, 4, 2);
            expect(result.success).to.be.false;
        });

        it('turn 2 - draws too many tiles and overflows onto floor line', () => {
            const factoryDisplay = state.factoryDisplays[1];
            const result = drawFromFactoryDisplay(state, factoryDisplay, player2, 1, 0);
            expect(result.success).to.be.true;
            expect(player2.patternLines[0]).to.have.length(1);
            expect(player2.patternLines[0][0].colourId).to.equal(1);
            expect(player2.patternLines[1]).to.deep.equal([null, null]);
            expect(player2.patternLines[2]).to.deep.equal([null, null, null]);
            expect(player2.patternLines[3]).to.deep.equal([null, null, null, null]);
            expect(player2.patternLines[4]).to.deep.equal([null, null, null, null, null]);
            expect(player2.floorLine).to.have.length(1);
            expect(player2.floorLine[0].colourId).to.equal(1);
            expect(state.centerOfTable).to.have.length(4);
            expect(state.centerOfTable[0].colourId).to.equal(-1);
            expect(state.centerOfTable[1].colourId).to.equal(1);
            expect(state.centerOfTable[2].colourId).to.equal(2);
            expect(state.centerOfTable[3].colourId).to.equal(0);
            expect(state.nextRoundStartingPlayerIndex).to.equal(null);
        });

        it('turn 3 - draws from center of table', () => {
            const result = drawFromCenter(state, player1, 2, 1);
            expect(result.success).to.be.true;
            expect(player1.patternLines[0]).to.deep.equal([null]);
            expect(player1.patternLines[1]).to.have.length(2);
            expect(player1.patternLines[1][0].colourId).to.equal(2);
            expect(player1.patternLines[1][1]).to.be.null;
            expect(player1.patternLines[2].every(tile => tile.colourId === 0)).to.be.true;
            expect(player1.patternLines[3]).to.deep.equal([null, null, null, null]);
            expect(player1.patternLines[4]).to.deep.equal([null, null, null, null, null]);
            expect(player1.floorLine[0].colourId).to.equal(-1);
            expect(state.centerOfTable[0].colourId).to.equal(1);
            expect(state.centerOfTable[1].colourId).to.equal(0);
            expect(state.nextRoundStartingPlayerIndex).to.equal(0);
        });
    });

    describe('dealTilesToFactoryDisplays', () => {
        const state = createGameState();
        addPlayer(state, createPlayer());
        addPlayer(state, createPlayer());
        addPlayer(state, createPlayer());

        it('should fill factory displays with tiles', () => {
            fillTileBag(state);
            dealTilesToFactoryDisplays(state);
            expect(state.factoryDisplays.length).to.equal(7);
            state.factoryDisplays.forEach(factoryDisplay => {
                expect(factoryDisplay.length).to.equal(4);
            });
        });
    });

    describe('addTilesToFloorLine', () => {
        it('should add tiles to floor line', () => {
            const state = createGameState();
            addPlayer(state, createPlayer());
            const [player] = state.players;
            const tiles = [0, 1, 2, 3, 4, 5, 6];
            addTilesToFloorLine(state, player, tiles);
            expect(player.floorLine.length).to.equal(7);
            expect(player.floorLine[4]).to.equal(4);
            expect(player.floorLine[6]).to.equal(6);
            expect(state.discardedTiles.length).to.equal(0);
        });

        it('overflows to discard pile', () => {
            const state = createGameState();
            addPlayer(state, createPlayer());
            const [player] = state.players;
            const tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            addTilesToFloorLine(state, player, tiles);
            expect(player.floorLine.length).to.equal(7);
            expect(player.floorLine).to.deep.equal([0, 1, 2, 3, 4, 5, 6]);
            expect(state.discardedTiles.length).to.equal(3);
            expect(state.discardedTiles).to.deep.equal([7, 8, 9]);
        });
    });

    describe('scoreRound', () => {
        it('adds points for completing colour', () => {
            const state = createGameState();
            const player1 = addPlayer(state, createPlayer());
            player1.patternLines[0] = [createTile(1, 1)];
            player1.patternLines[1] = [createTile(1, 1), createTile(1, 1)];
            player1.patternLines[2] = [createTile(1, 1), createTile(1, 1), createTile(1, 1)];
            player1.patternLines[3] = [createTile(1, 1), createTile(1, 1), createTile(1, 1), createTile(1, 1)];
            player1.patternLines[4] = [createTile(1, 1), createTile(1, 1), createTile(1, 1), createTile(1, 1), createTile(1, 1)];
            player1.floorLine = [createTile(1, 1), createTile(1, 1)];
            const { roundScores } = scoreRound(state);
            expect(player1.score).to.equal(5 + 10 - 2);
            const [playerScores] = roundScores;
            playerScores.forEach(scores => {
                if (scores.patternLineIndex === -1) {
                    expect(scores.floorLinePoints).to.equal(-2);
                    return;
                }
                expect(scores.columnScore).to.equal(0);
                expect(scores.rowScore).to.equal(1);
            });
            expect(playerScores[3].colourScore).to.equal(0);
            expect(playerScores[4].colourScore).to.equal(10);
        });
    });

    describe('final move in round', () => {
        let state;
        before(() => {
            state = loadGame({
                rules: { numberOfColours: 5, tilesPerColour: 20, tilesPerFactoryDisplay: 4, floorLinePenalties: [-1, -1, -2, -2, -2, -3, -3], rowPoints: 2, columnPoints: 7, colourPoints: 10, firstPickFromCentre: -1 },
                players: [
                    {
                        index: 0, name: 'PLAYER ONE', score: 0,
                        patternLines: [
                            [{ id: 66, colourId: 3 }],
                            [{ id: 98, colourId: 4 }, { id: 85, colourId: 4 }],
                            [{ id: 72, colourId: 3 }, { id: 64, colourId: 3 }, { id: 65, colourId: 3 }],
                            [null, null, null, null],
                            [{ id: 4, colourId: 0 }, { id: 20, colourId: 0 }, { id: 7, colourId: 0 }, null, null]],
                        wall: [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]], floorLine: [{ id: 78, colourId: 3 }]
                    },
                    {
                        index: 1, name: 'PLAYER 2', score: 0,
                        patternLines: [
                            [{ id: 55, colourId: 2 }],
                            [{ id: 67, colourId: 3 }, { id: 68, colourId: 3 }],
                            [null, null, null],
                            [null, null, null, null],
                            [{ id: 82, colourId: 4 }, { id: 99, colourId: 4 }, { id: 86, colourId: 4 }, { id: 97, colourId: 4 }, { id: 96, colourId: 4 }]
                        ],
                        wall: [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]], floorLine: [{ id: 1, colourId: -1 }]
                    }],
                currentPlayerIndex: 0,
                nextRoundStartingPlayerIndex: 1,
                factoryDisplays: [[], [], [], [], []],
                centerOfTable: [{ id: 29, colourId: 1 }, { id: 39, colourId: 1 }],
                tileBag: [{ id: 89, colourId: 4 }, { id: 100, colourId: 4 }, { id: 1, colourId: 0 }, { id: 54, colourId: 2 }, { id: 83, colourId: 4 }, { id: 76, colourId: 3 }, { id: 93, colourId: 4 }, { id: 69, colourId: 3 }, { id: 2, colourId: 0 }, { id: 30, colourId: 1 }, { id: 42, colourId: 2 }, { id: 50, colourId: 2 }, { id: 75, colourId: 3 }, { id: 45, colourId: 2 }, { id: 74, colourId: 3 }, { id: 84, colourId: 4 }, { id: 94, colourId: 4 }, { id: 47, colourId: 2 }, { id: 21, colourId: 1 }, { id: 91, colourId: 4 }, { id: 71, colourId: 3 },
                    { id: 81, colourId: 4 }, { id: 90, colourId: 4 }, { id: 8, colourId: 0 }, { id: 19, colourId: 0 }, { id: 58, colourId: 2 }, { id: 5, colourId: 0 }, { id: 37, colourId: 1 }, { id: 70, colourId: 3 }, { id: 3, colourId: 0 }, { id: 73, colourId: 3 }, { id: 80, colourId: 3 }, { id: 79, colourId: 3 }, { id: 88, colourId: 4 }, { id: 28, colourId: 1 }, { id: 77, colourId: 3 }, { id: 56, colourId: 2 }, { id: 95, colourId: 4 }, { id: 41, colourId: 2 }, { id: 87, colourId: 4 }, { id: 92, colourId: 4 }, { id: 51, colourId: 2 },
                    { id: 17, colourId: 0 }, { id: 52, colourId: 2 }, { id: 46, colourId: 2 }, { id: 48, colourId: 2 }, { id: 34, colourId: 1 }, { id: 43, colourId: 2 }, { id: 32, colourId: 1 }, { id: 9, colourId: 0 }, { id: 60, colourId: 2 }, { id: 23, colourId: 1 }, { id: 10, colourId: 0 }, { id: 40, colourId: 1 }, { id: 27, colourId: 1 }, { id: 57, colourId: 2 }, { id: 33, colourId: 1 }, { id: 62, colourId: 3 }, { id: 18, colourId: 0 }, { id: 49, colourId: 2 },
                    { id: 44, colourId: 2 }, { id: 59, colourId: 2 }, { id: 26, colourId: 1 }, { id: 6, colourId: 0 }, { id: 61, colourId: 3 }, { id: 11, colourId: 0 }, { id: 36, colourId: 1 }, { id: 25, colourId: 1 }, { id: 63, colourId: 3 }, { id: 35, colourId: 1 }, { id: 12, colourId: 0 }, { id: 53, colourId: 2 }, { id: 38, colourId: 1 }, { id: 31, colourId: 1 }, { id: 14, colourId: 0 }, { id: 22, colourId: 1 }, { id: 24, colourId: 1 }, { id: 15, colourId: 0 }, { id: 13, colourId: 0 }, { id: 16, colourId: 0 }],
                discardedTiles: [],
                roundIndex: 0
            });
            drawFromCenter(state, state.players[0], 1, 3);
        });

        it('should move tiles to the wall', () => {
            const [player1, player2] = state.players;
            expect(player1.wall[0][3].colourId).to.eq(3);
            expect(player1.wall[1][0].colourId).to.eq(4);
            expect(player1.wall[2][0].colourId).to.eq(3);
            expect(player1.wall[3].every(e => !e)).to.be.true;
            expect(player1.wall[4].every(e => !e)).to.be.true;

            expect(player2.wall[0][2].colourId).to.eq(2);
            expect(player2.wall[1][4].colourId).to.eq(3);
            expect(player2.wall[2].every(e => !e)).to.be.true;
            expect(player2.wall[3].every(e => !e)).to.be.true;
            expect(player2.wall[4][3].colourId).to.eq(4);
        });

        it('should add up some scores', () => {
            expect(state.players[0].score).to.eq(3);
            expect(state.players[1].score).to.eq(2);
        });

        it('should return the start tile to the center', () => {
            const tile = state.centerOfTable[0];
            expect(tile).to.be.instanceOf(Tile);
            expect(tile.colourId).to.eq(-1);
        });
    });
});
