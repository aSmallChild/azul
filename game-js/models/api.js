import { drawFromCenter, drawFromFactoryDisplay } from '../functions/gameStandard.js';
import { stateAsSeenByPlayer } from './game.js';

export default function createGameApi(game) {
    return {
        drawTiles(factoryDisplayIndex, colourId, targetPatternLineIndex) {
            const validationError = validateParams(game, factoryDisplayIndex, colourId, targetPatternLineIndex);
            if (validationError) {
                return validationError;
            }
            const player = game.state.players[game.state.currentPlayerIndex];
            if (factoryDisplayIndex < 0) {
                return drawFromCenter(game.state, player, colourId, targetPatternLineIndex);
            }
            const factoryDisplay = game.state.factoryDisplays[factoryDisplayIndex];
            return drawFromFactoryDisplay(game.state, factoryDisplay, player, colourId, targetPatternLineIndex)
        },
        getState() {
            return stateAsSeenByPlayer(game.state);
        }
    };
}

function validateParams(game, factoryDisplayIndex, colourId, targetPatternLineIndex) {
    if (isNaN(factoryDisplayIndex) || factoryDisplayIndex >= game.state.factoryDisplays.length) {
        return {
            success: false,
            message: `factoryDisplayIndex must be a number between -1 and ${game.state.factoryDisplays.length - 1}`
        };
    }

    if (isNaN(colourId) || colourId < 0 || colourId >= game.state.rules.numberOfColours) {
        return {
            success: false,
            message: `colourId must be a number between 0 and ${game.state.rules.numberOfColours - 1}`
        };
    }

    if (isNaN(targetPatternLineIndex) || targetPatternLineIndex >= game.state.factoryDisplays.length) {
        return {
            success: false,
            message: `targetPatternLineIndex must be a number between -1 and ${game.state.factoryDisplays.length - 1}`
        };
    }

    return null;
}
