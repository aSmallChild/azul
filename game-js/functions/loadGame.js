import { transformTiles } from './tileIterator.js';
import Tile from '../models/tile.js';

export default function loadGame(gameState) {
    gameState.emit = () => {};
    transformTiles(gameState, (tile) => new Tile(tile.id, tile.colourId));
    return gameState;
}
