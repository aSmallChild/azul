import { drawTiles } from '../functions/gameStandard.js';

export default function createGameApi(game) {
    return {
        drawTiles(factoryDisplayIndex, colourId, targetPatternLineIndex) {
            const validationError = validateParams(game, factoryDisplayIndex, colourId, targetPatternLineIndex);
            if (validationError) {
                return validationError;
            }
            return drawTiles(game.state, factoryDisplayIndex, colourId, targetPatternLineIndex);
        },
        getState() {
            return structuredClone(game.state);
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
