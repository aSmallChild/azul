// https://youtu.be/l-hh51ncgDI
import rngBot from './rngBot';
import { drawTiles, scoreRound } from 'azul/functions/gameStandard.js';

export default function minimaxBot(gameState, depth = 3, moves = 3) {
    const immediateMoves = buildTree(gameState, null, depth, moves);

    const currentPlayerId = gameState.currentPlayerIndex;
    // https://youtu.be/l-hh51ncgDI?t=530

    for (const immediateMove of immediateMoves) {
        // traverse down to the bottom (which is either until there is a winning move in which case we select the current immediate move or
        // sort moves at the bottom
    }
}

function buildTree(gameState, lastMove = null, depth = 3, moves = 3) {
    if (depth < 0) {
        return null;
    }
    const possibleMoves = [];
    for (let i = 0; i < moves; i++) {
        const move = rngBot(gameState); // todo allow rngBot to return more moves in a single call
        if (!move) {
            break;
        }
        const state = structuredClone(gameState);
        const result = drawTiles(state, move.displayId, move.colourId, move.lineId);
        let {
            isGameOver,
            roundScores = null,
            winners = null
        } = result;
        if (!roundScores) {
            const scoreState = structuredClone(state);
            const scores = scoreRound(scoreState);
            roundScores = scores.roundScores;
            winners = scores.winners;
        }
        possibleMoves.push({
            move,
            roundScores,
            winnerIds: winners.map(winner => winner.index),
            isGameOver,
            nextMoves: isGameOver ? null : buildTree(state, move, depth - 1, moves)
        });
    }

    return possibleMoves.length ? possibleMoves : null;
}

function sortMoves(moves, currentPlayerId) {
    moves.sort((a, b) => {
        const wonLastMove = wonInMoveRank(a, currentPlayerId);
        const wonCurrentMove = wonInMoveRank(b, currentPlayerId);
        const winnerDifference = wonLastMove - wonCurrentMove;
        if (winnerDifference) {
            return winnerDifference >= 0 ? a : b;
        }
        const scoreDifference = a.roundScores[currentPlayerId].score - b.roundScores[currentPlayerId].score;
        return scoreDifference >= 0 ? a : b;
    });
}

function wonInMoveRank(move, currentPlayerId) {
    let wonInThisMove = move.winnerIds.find(winnerId => winnerId === currentPlayerId) ? 1 : -1;
    if (wonInThisMove > 0 && move.winners.length === 1) {
        wonInThisMove += move.isGameOver ? 2 : 1;
    }
    return wonInThisMove;
}
