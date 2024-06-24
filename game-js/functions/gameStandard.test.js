import { addPlayer, dealTilesToFactoryDisplays, fillTileBag } from './gameStandard.js';
import { createGameRules, createGameState, createPlayer } from '../models/game.js';
import { expect } from 'chai';


describe('dealTilesToFactoryDisplays', () => {
    const rules = createGameRules();
    const state = createGameState();
    addPlayer(state, createPlayer());
    addPlayer(state, createPlayer());
    addPlayer(state, createPlayer());

    it('should fill factory displays with tiles', () => {
        fillTileBag(state, rules);
        dealTilesToFactoryDisplays(state, rules);
        expect(state.factoryDisplays.length).to.equal(7);
        state.factoryDisplays.forEach(factoryDisplay => {
            expect(factoryDisplay.length).to.equal(4);
        });
    });
});
