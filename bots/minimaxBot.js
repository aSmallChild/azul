import rngBot from './rngBot.js';
import { determineWinners, drawTiles, scoreRound } from 'azul/functions/gameStandard.js';

export default function minimaxBot(gameState, depth = 4, moves = 4) {
    const immediateMoves = buildTree(gameState, null, depth, moves);
    const nextMove = findMoveThatLeadsToBestOutcome(immediateMoves, gameState.currentPlayerIndex);
    return nextMove.move;
}

function findMoveThatLeadsToBestOutcome(immediateMoves, playerId) {
    const allMoves = [];
    allMoves.push(...immediateMoves);
    for (let i = 0; i < allMoves.length; i++) {
        const currentMove = allMoves[i];
        if (currentMove.nextMoves) {
            allMoves.push(...currentMove.nextMoves);
        }
    }
    sortMoves(allMoves, playerId);
    let immediateMove = allMoves[0];
    while (immediateMove.previousNode) {
        immediateMove = immediateMove.previousNode;
    }
    return immediateMove;
}

function buildTree(gameState, previousNode = null, depth = 3, moves = 3) {
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
            winners = scores.winners ?? determineWinners(scoreState, roundScores);
        }
        else if (!winners) {
            winners = determineWinners(state, roundScores);
        }
        const node = {
            move,
            previousNode,
            roundScores,
            winnerIds: winners.map(winner => winner.index),
            isGameOver,
            nextMoves: null
        }
        if (isGameOver) {
            buildTree(state, node, depth - 1, moves);
        }
        possibleMoves.push(node);
    }

    return possibleMoves.length ? possibleMoves : null;
}

function sortMoves(moves, currentPlayerId) {
    moves.sort((a, b) => {
        const wonLastMove = wonInMoveRank(a, currentPlayerId);
        const wonCurrentMove = wonInMoveRank(b, currentPlayerId);
        const winnerDifference = wonCurrentMove - wonLastMove;
        if (winnerDifference) {
            return winnerDifference;
        }
        return b.roundScores[currentPlayerId].score - a.roundScores[currentPlayerId].score;
    });
}

function wonInMoveRank(move, currentPlayerId) {
    let wonInThisMove = move.winnerIds.find(winnerId => winnerId === currentPlayerId) ? 1 : -1;
    if (wonInThisMove > 0 && move.winnerIds.length === 1) {
        wonInThisMove += move.isGameOver ? 2 : 1;
    }
    return wonInThisMove;
}
