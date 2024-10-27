import { hostTournament, createPlayer as createTournamentPlayer } from 'azul/functions/tournament.js';
import { addPlayer, startGame, drawTiles } from 'azul/functions/gameStandard.js';
import { createGameState, createPlayer } from 'azul/models/game.js';
import rngBot from './rngBot.js';
import minimaxBot, {sortStats} from './minimaxBot.js';

hostTournament([
        createTournamentPlayer('RNG Bot', rngBot),
        createTournamentPlayer('Minimax Bot', minimaxBot),
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
