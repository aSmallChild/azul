import { parentPort } from 'worker_threads';
import { buildTreeNodes } from './minimaxBot.js'; // Ensure this method is accessible

parentPort.on('message', (taskData) => {
    const { gameState, parent, depth, moves } = taskData;
    const result = buildTreeNodes(gameState, parent, depth, moves);
    parentPort.postMessage(result);
});
