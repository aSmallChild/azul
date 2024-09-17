function hostTournament(players = [
    {
        name: 'algo name',
        totalScore: 0,
        wins: 0,
        drawTiles(gameState = {}) {
            return {displayId: 0, colourId: 0, lineId: 0};
        }
    }
], params = {}) {
    const {
        iterations = 1000,
        createGame,
        addPlayer,
        startGame,
        drawTiles
    } = params;

    for (let i = 0; i < iterations; i++) {
        const state = createGame();
        players.forEach(player => addPlayer(state, player));
        startGame();
        let turnResult;
        do {
            const {displayId, colourId, lineId} = players[state.currentPlayerIndex].drawTiles(state);
            turnResult = drawTiles(displayId, colourId, lineId);
            if (!turnResult.success) {
                return 'FAIL';
            }
        } while (!turnResult.isGameOver);

        for (const winner of turnResult.winners) {
            players[winner.index].totalScore += winner.score;
            players[winner.index].wins++;
        }
    }

}
