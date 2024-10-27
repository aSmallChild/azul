export function createPlayer(name, drawTiles) {
    return {
        name,
        drawTiles,
        totalScore: 0,
        wins: 0,
    }
}

export function hostTournament(players = [], params = {}) {
    const {
        iterations = 1000,
        createGame,
        createPlayer,
        addPlayer,
        startGame,
        drawTiles
    } = params;
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
        const gameStart = Date.now();
        const state = createGame();
        players.forEach(player => addPlayer(state, createPlayer(player)));
        startGame(state);
        let turnResult;
        do {
            const player = players[state.currentPlayerIndex];
            const move = player.drawTiles(state);
            if (!move) {
                const message = `Player ${player.name} could not figure out what move to make!`;
                console.error(message);
                return {
                    success: false,
                    message
                };
            }
            const { displayId, colourId, lineId } = move;
            turnResult = drawTiles(state, displayId, colourId, lineId);
            if (!turnResult.success) {
                const message = `Player ${player.name} attempted an invalid move!`;
                console.error(message);
                return {
                    success: false,
                    message
                };
            }
        } while (!turnResult.isGameOver);
        const gameDuration = Date.now() - gameStart;

        console.info(`Game ${i + 1} complete, ${turnResult.winners.length} winner(s), ${turnResult.winners.map(winner => `${winner.name} (${winner.score} points)`).join(', ')} in ${gameDuration}ms`);

        for (const winner of turnResult.winners) {
            players[winner.index].totalScore += winner.score;
            players[winner.index].wins++;
        }
    }

    const duration = Date.now() - start;
    console.info(`Tournament complete ${duration}ms`);
    const placings = players.map(player => player);
    placings.sort((a, b) => {
        const winDifference = b.wins - a.wins;
        if (winDifference) {
            return winDifference;
        }

        return b.totalScore - a.totalScore;
    });
    placings.forEach((player, i) => {
        console.info(`${i + 1}${placingSuffix(i)} place: ${player.name} with ${player.wins} wins and an average score of ${Math.round(player.totalScore / iterations)}`);
    });

    return {
        success: true,
        placings
    };
}

function placingSuffix(index) {
    index++;
    index += '';
    if (index.endsWith(1)) {
        return 'st';
    }

    if (index.endsWith(2)) {
        return 'nd';
    }

    if (index.endsWith(3)) {
        return 'rd';
    }

    return 'th';
}
