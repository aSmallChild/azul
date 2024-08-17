import { addPlayer, addTilesToFloorLine, dealTilesToFactoryDisplays, drawFromCenter, drawFromFactoryDisplay, fillTileBag, scoreRound } from './gameStandard.js';
import { createGameState, createPlayer } from '../models/game.js';
import { createTile } from '../models/tile.js';
import { expect } from 'chai';

describe('Standard game tests', () => {
    describe('addPlayer', () => {
        const state = createGameState();
        const player = createPlayer();
        addPlayer(state, player);

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
            const roundScores = scoreRound(state);
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
});
