import { addPlayer, addTilesToFloorLine, dealTilesToFactoryDisplays, drawFromFactoryDisplay, fillTileBag } from './gameStandard.js';
import { createGameState, createPlayer } from '../models/game.js';
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

    describe('drawFromFactoryDisplay', () => {
        let state;
        state = createGameState();
        addPlayer(state, createPlayer());
        addPlayer(state, createPlayer());
        state.factoryDisplays = [
            [0, 0, 0, 1],
            [1, 2, 0, 1],
            [2, 1, 0, 3],
            [3, 3, 0, 2],
            [3, 3, 0, 2],
        ];

        const [player1, player2] = state.players;
        it('turn 1 - draw tiles from factory display', () => {
            const factoryDisplay = state.factoryDisplays[0];
            const result = drawFromFactoryDisplay(state, factoryDisplay, player1, 0, 2);
            expect(result.success, result.message).to.be.true;
            expect(factoryDisplay.length).to.equal(0);
            expect(player1.patternLines[0]).to.deep.equal([null]);
            expect(player1.patternLines[1]).to.deep.equal([null, null]);
            expect(player1.patternLines[2]).to.deep.equal([0, 0, 0]);
            expect(player1.patternLines[3]).to.deep.equal([null, null, null, null]);
            expect(player1.patternLines[4]).to.deep.equal([null, null, null, null, null]);
            expect(player1.floorLine.length).to.equal(0);
            expect(state.centerOfTable).to.deep.equal([-1, 1]);
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
            expect(player2.patternLines[0]).to.deep.equal([1]);
            expect(player2.patternLines[1]).to.deep.equal([null, null]);
            expect(player2.patternLines[2]).to.deep.equal([null, null, null]);
            expect(player2.patternLines[3]).to.deep.equal([null, null, null, null]);
            expect(player2.patternLines[4]).to.deep.equal([null, null, null, null, null]);
            expect(player2.floorLine).to.deep.equal([1]);
            expect(state.centerOfTable).to.deep.equal([-1, 1, 2, 0]);
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
});
