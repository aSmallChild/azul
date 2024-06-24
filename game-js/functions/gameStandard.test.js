import { addPlayer, addTilesToFloorLine, dealTilesToFactoryDisplays, fillTileBag } from './gameStandard.js';
import { createGameState, createPlayer } from '../models/game.js';
import { expect } from 'chai';


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
