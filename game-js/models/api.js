import emitter from './emitter.js';
import { drawFromCenter, drawFromFactoryDisplay } from '../functions/gameStandard.js';

export default function createGameApi(game) {
    const api = emitter({
        drawTiles(factoryDisplayIndex, colourId, targetPatternLineIndex) {
            validateParams(game, factoryDisplayIndex, colourId, targetPatternLineIndex);
            const player = game.state.players[game.state.currentPlayerIndex];
            if (factoryDisplayIndex < 0) {
                return drawFromCenter(game.state, player, colourId, targetPatternLineIndex);
            }
            const factoryDisplay = game.state.factoryDisplays[factoryDisplayIndex];
            return drawFromFactoryDisplay(game.state, factoryDisplay, player, colourId, targetPatternLineIndex)
        },
        getGameState() {
            return game.state.dataAvailableToPlayer();
        }
    });
    game.on('player-turn', (eventData) => api.emit('player-turn', eventData));
    game.on('game-over', (eventData) => api.emit('game-over', eventData));
    return api;
}

function validateParams(game, factoryDisplayIndex, colourId, targetPatternLineIndex) {
    if (isNaN(factoryDisplayIndex) || factoryDisplayIndex >= game.state.factoryDisplays.length) {
        throw new Error(`factoryDisplayIndex must be a number between -1 and ${game.state.factoryDisplays.length - 1}`);
    }

    if (isNaN(colourId) || colourId < 0 || colourId >= game.state.numberOfColours) {
        throw new Error(`colourId must be a number between 0 and ${game.state.numberOfColours - 1}`);
    }

    if (isNaN(targetPatternLineIndex) || targetPatternLineIndex >= game.state.factoryDisplays.length) {
        throw new Error(`targetPatternLineIndex must be a number between -1 and ${game.state.factoryDisplays.length - 1}`);
    }
}
