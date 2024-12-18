import { hostTournament, createPlayer as createTournamentPlayer } from 'azul/functions/tournament.js';
import { addPlayer, startGame, drawTiles } from 'azul/functions/gameStandard.js';
import { createGameState, createPlayer } from 'azul/models/game.js';
import rngBot from './rngBot.js';
import minimaxBot, {sortStats} from './minimaxBot.js';

await hostTournament([
        createTournamentPlayer('RNG Bot 1', rngBot),
        createTournamentPlayer('RNG Bot 2', rngBot),
        // createTournamentPlayer('RNG Bot 3', rngBot),
        // createTournamentPlayer('RNG Bot 4', rngBot),
        createTournamentPlayer('Minimax Bot (depth 2, moves 10)', minimaxBot),
        createTournamentPlayer('Minimax Bot (depth 4, moves 4)', state => minimaxBot(state, 4, 4)),
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
