import getPossibleMoves from './getPossibleMoves.js';
import { drawTiles, scoreRound, sumRoundScores } from 'azul/functions/gameStandard.js';
import { countDisplayTiles, countLineTiles } from './util/line.js';

export const testExports = {
    buildTreeNodes,
    sortNodes,
    completedRowChecks
};

export const sortStats = {
    currentPlayerDifference: 0,
    winnerDifference: 0,
    scoreDifference: 0,
    completedRowDifference: 0,
    noChange: 0,
}

export default async function minimaxBot(gameState, options = {}) {
    const { depth = 2, moves = 10, workerPool = null } = options;
    if (depth < 1) {
        throw new Error('Minimum depth is 1');
    }
    let nodes = buildTreeNodes(gameState, null, 0, moves);
    let unprocessedNodeIndex = 0;
    for (let i = 1; i < depth; i++) {
        const newNodes = [];
        while (unprocessedNodeIndex < nodes.length) {
            const node = nodes[unprocessedNodeIndex++];
            if (!node.isGameOver && !node.isNewRound) {
                if (!workerPool) {
                    newNodes.push(...buildTreeNodes(node.state, node, i, moves));
                    continue;
                }
                newNodes.push(workerPool.runTask({ gameState: node.state, parent: node, depth: i, moves }));
            }
        }
        if (!workerPool) {
            nodes.push(...newNodes);
            continue;
        }

        for (const nextNewNodes of await Promise.all(newNodes)) {
            nodes.push(...nextNewNodes);
        }
    }
    const nextMove = findNodeThatLeadsToBestOutcome(nodes, gameState.currentPlayerIndex);
    return nextMove.move;
}

function findNodeThatLeadsToBestOutcome(immediateNodes, playerId) {
    let allNodes = [].concat(immediateNodes);
    for (let i = 0; i < allNodes.length; i++) {
        const currentMove = allNodes[i];
        if (currentMove.nextMoves) {
            allNodes = allNodes.concat(currentMove.nextMoves);
        }
    }
    const playerMoves = allNodes.filter(node => node.previousState.currentPlayerIndex === playerId);
    sortNodes(playerMoves, playerId);
    let immediateMove = playerMoves[0];
    while (immediateMove.previousNode) {
        immediateMove = immediateMove.previousNode;
    }
    return immediateMove;
}

export function buildTreeNodes(gameState, previousNode = null, depth = 3, moves = 3) {
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
            const scores = scoreRound(state, false);
            roundScores = scores.roundScores;
            winners = scores.winners;
        }
        nodes.push({
            move,
            previousNode,
            roundScores,
            playerScoreDelta: roundScores.map(sumRoundScores),
            winnerIds: winners?.map(winner => winner.index) ?? [],
            isGameOver,
            isNewRound,
            state,
            previousState: gameState,
            nextMoves: null,
            depth,
        });
    }
    sortNodes(nodes, gameState.currentPlayerIndex);
    return nodes.slice(0, moves);
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

        const scoreDifference = b.playerScoreDelta[currentPlayerId] - a.playerScoreDelta[currentPlayerId];
        // if (scoreDifference) {
        //     sortStats.scoreDifference++;
        //     return scoreDifference;
        // }

        const completedRowDifference = completedRowChecks(a, b);
        // if (completedRowDifference) {
        //     sortStats.completedRowDifference++;
        //     return completedRowDifference;
        // }

        const depthDifference = a.depth - b.depth; // smaller depth the better
        return plusOrMinusOne(scoreDifference) * 3 + plusOrMinusOne(completedRowDifference) * 2 + plusOrMinusOne(depthDifference);
        // sortStats.noChange++;
        // return 0;
    });
}

function wonInMoveRank(move, currentPlayerId) {
    if (!move.winnerIds.includes(currentPlayerId)) {
        return 0;
    }
    return move.isGameOver && move.winnerIds.length === 1 ? 2 : 1;
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
    const progressDifference = pB.progress - pA.progress;
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
    const display = move.displayId < 0 ? previousState.centerOfTable : previousState.factoryDisplays[move.displayId];
    const tilesDrawn = countDisplayTiles(display, move.colourId);
    if (move.lineId < 0) {
        return { progress: -1 * tilesDrawn, tilesRequired: -1, tilesDrawn };
    }
    const line = player.patternLines[move.lineId];
    const tilesRequired = line.length - countLineTiles(line);
    return { progress: -1 * (tilesDrawn - tilesRequired), tilesRequired, tilesDrawn };
}

function plusOrMinusOne(n) {
    if (!n) {
        return 0;
    }
    return n > 0 ? 1 : -1;
}
