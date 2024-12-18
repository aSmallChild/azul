import { createPlayer as createTournamentPlayer, hostTournament } from 'azul/functions/tournament.js';
import { addPlayer, drawTiles, startGame } from 'azul/functions/gameStandard.js';
import { createGameState, createPlayer } from 'azul/models/game.js';
import rngBot from './rngBot.js';
import minimaxBot, { sortStats } from './minimaxBot.js';
import { availableParallelism } from 'os';
import { WorkerPool } from './util/WorkerPool.js';

const workerPool = new WorkerPool('./minimaxBotTree.js', availableParallelism());

await hostTournament([
        createTournamentPlayer('RNG Bot 1', rngBot),
        createTournamentPlayer('RNG Bot 2', rngBot),
        // createTournamentPlayer('RNG Bot 3', rngBot),
        // createTournamentPlayer('RNG Bot 4', rngBot),
        createTournamentPlayer('Minimax Bot (depth 1, moves 5)', state => minimaxBot(state, { depth: 1, moves: 5, workerPool })),
        // createTournamentPlayer('Minimax Bot (depth 4, moves 4)', state => minimaxBot(state, { depth: 4, moves: 4, workerPool })),
        createTournamentPlayer('Minimax Bot (depth 5, moves 5)', state => minimaxBot(state, { depth: 5, moves: 5, workerPool })),
    ],
    {
        createGame: createGameState,
        createPlayer,
        addPlayer,
        startGame,
        drawTiles
    }
);

console.info('Minimax sort stats', sortStats)
