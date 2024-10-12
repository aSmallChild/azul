import getPossibleMoves from './getPossibleMoves.js';
import { determineWinners, drawTiles, scoreRound } from 'azul/functions/gameStandard.js';

export default function minimaxBot(gameState, depth = 10, moves = 2) {
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
            nextMoves: null
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

function sortNodes(moves, currentPlayerId) {
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
