import getPossibleMoves from './getPossibleMoves.js';
import { determineWinners, drawTiles, scoreRound } from 'azul/functions/gameStandard.js';
import { countDisplayTiles, countLineTiles } from './util/line.js';

export default function minimaxBot(gameState, depth = 2, moves = 10) {
    const immediateNodes = buildTree(gameState, null, depth, moves);
    const nextMove = findNodeThatLeadsToBestOutcome(immediateNodes, gameState.currentPlayerIndex);
    return nextMove.move;
}

function findNodeThatLeadsToBestOutcome(immediateNodes, playerId) {
    const allNodes = [];
    allNodes.push(...immediateNodes);
    for (let i = 0; i < allNodes.length; i++) {
        const currentMove = allNodes[i];
        if (currentMove.nextMoves) {
            allNodes.push(...currentMove.nextMoves);
        }
    }
    sortNodes(allNodes, playerId);
    let immediateMove = allNodes[0];
    while (immediateMove.previousNode) {
        immediateMove = immediateMove.previousNode;
    }
    return immediateMove;
}

function buildTree(gameState, previousNode = null, depth = 3, moves = 3) {
    if (depth < 0) {
        return null;
    }

    const nodes = [];
    for (const move of getPossibleMoves(gameState)) {
        const state = structuredClone(gameState);
        const result = drawTiles(state, move.displayId, move.colourId, move.lineId);
        let {
            isGameOver,
            isNewRound,
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
            isNewRound,
            state,
            previousState: gameState,
            nextMoves: null,
            depth,
        }
        nodes.push(node);
    }
    if (!nodes.length) {
        return null;
    }

    sortNodes(nodes, nodes[0].state.currentPlayerIndex);
    const topNodes = nodes.slice(0, moves);
    for (const node of topNodes) {
        if (!node.isGameOver && !node.isNewRound) {
            buildTree(node.state, node, depth - 1, moves);
        }
    }
    return topNodes;
}

export const sortStats = {
    currentPlayerDifference: 0,
    winnerDifference: 0,
    scoreDifference: 0,
    completedRowDifference: 0,
    noChange: 0,
}

function sortNodes(moves, currentPlayerId) {
    moves.sort((a, b) => {
        const aCurrent = a.previousState.currentPlayerIndex === currentPlayerId;
        const bCurrent = b.previousState.currentPlayerIndex === currentPlayerId;
        const currentPlayerDifference = bCurrent - aCurrent;
        if (currentPlayerDifference) {
            sortStats.currentPlayerDifference++;
            return currentPlayerDifference;
        }
        if (!aCurrent) {
            sortStats.noChange++;
            return 0;
        }

        const wonLastMove = wonInMoveRank(a, currentPlayerId);
        const wonCurrentMove = wonInMoveRank(b, currentPlayerId);
        const winnerDifference = wonCurrentMove - wonLastMove;
        if (winnerDifference) {
            sortStats.winnerDifference++;
            return winnerDifference;
        }

        const aScore = a.state.players[currentPlayerId].score - a.previousState.players[currentPlayerId].score;
        const bScore = b.state.players[currentPlayerId].score - b.previousState.players[currentPlayerId].score;
        const scoreDifference = bScore - aScore;
        // if (scoreDifference) {
        //     sortStats.scoreDifference++;
        //     return scoreDifference;
        // }
        //
        const completedRowDifference = completedRowChecks(a, b);
        // if (completedRowDifference) {
        //     sortStats.completedRowDifference++;
        //     return completedRowDifference;
        // }

        sortStats.noChange++;
        return scoreDifference + completedRowDifference + (Math.min(3, b.depth) - Math.min(3, a.depth))
        // return 0;
    });
}

function wonInMoveRank(move, currentPlayerId) {
    let wonInThisMove = move.winnerIds.find(winnerId => winnerId === currentPlayerId) ? 1 : -1;
    if (wonInThisMove > 0 && move.winnerIds.length === 1) {
        wonInThisMove += move.isGameOver ? 2 : 1;
    }
    return wonInThisMove;
}

function completedRowChecks(a, b) {
    // const lineA = a.move.lineId;
    // const lineB = b.move.lineId;
    // if (Math.max(lineA, lineB) < 0) {
    //     return 0;
    // }
    // if (Math.min(lineA, lineB) < 0) {
    //     return lineB - lineA;
    // }
    const pA = progressTowardRowCompletion(a.move, a.previousState);
    const pB = progressTowardRowCompletion(b.move, b.previousState);
    const progressDifference = Math.abs(pB.progress) - Math.abs(pA.progress);
    if (progressDifference) {
        return progressDifference;
    }

    const drawDifference = pB.tilesDrawn - pA.tilesDrawn;
    if (drawDifference) {
        return drawDifference;
    }

    // if a move completes a larger row than another move, bump it up
    // progressA.progress >= 0 && progressB.progress >= 0 e.g. both moves completed a line
    // progressA.tilesRequired > progressB.tilesRequired

    // if a move completes the same row but selects less tiles than the other move, bump it up (UNLESS, that other move that over selects prevents another player from completing a row of their own)
    // todo add a check for whether we over selected tiles, prefer selecting exactly the right amount (if there is no difference is score
    return 0;
}

/**
 *
 * @param move
 * @param previousState
 * @returns {{progress: number, tilesRequired: number, tilesDrawn: number}} progress: 0 is just right, positive means more tiles were drawn than needed, negative means line is still incomplete
 */
function progressTowardRowCompletion(move, previousState) {
    const playerId = previousState.currentPlayerIndex;
    const player = previousState.players[playerId];
    const display = move.displayId < 1 ? previousState.centerOfTable : previousState.factoryDisplays[move.displayId];
    const tilesDrawn = countDisplayTiles(display, move.colourId);
    if (move.lineId < 0) {
        return {progress: -1 * tilesDrawn, tilesRequired: -1, tilesDrawn};
    }
    const line = player.patternLines[move.lineId];
    const tilesRequired = line.length - countLineTiles(line);
    return {progress: -1 * (tilesRequired - tilesDrawn), tilesRequired, tilesDrawn};
}
