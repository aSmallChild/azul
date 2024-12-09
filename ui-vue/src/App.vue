<script setup>
import Board from './components/Board.vue';
import Tiles from './components/Tiles.vue';
import { nextTick, onMounted, provide, ref } from 'vue';
import { addPlayer, startGame } from 'azul/functions/gameStandard.js';
import loadGame from 'azul/functions/loadGame.js';
import { createGameState, createPlayer } from 'azul/models/game.js';
import FactoryDisplay from './components/FactoryDisplay.vue';
import emitter from 'azul/models/emitter.js';
import createGameApi from 'azul/models/api.js';
import { getColourByName } from './util/colours.js';
import minimaxBot from 'bots/minimaxBot.js';

const players = ref([]);
const currentPlayerIndex = ref(0)
const playerBoards = ref();
const highlight = ref({});
const factoryDisplays = ref();
const tableCenter = ref();
const centerSize = ref(1);
const discardedTiles = ref();
const discardedTilesSize = ref(0);
const tiles = ref();
const game = {
    state: createGameState(),
    highlight
};
let selectedTileId;
let midPlacement = false;
addPlayer(game.state, createPlayer({ name: 'PLAYER ONE' }));
addPlayer(game.state, createPlayer({ name: 'PLAYER 2' }));
// addPlayer(game.state, createPlayer({ name: 'PLAYER THREE' }));
// addPlayer(game.state, createPlayer({ name: 'Bob' }));

startGame(game.state);
emitter(game);
setGameState(game.state);
window.game = createGameApi(game);
window.colour = (name) => getColourByName(name, game.state.rules.numberOfColours);
window.row = (id) => id > 0 ? id - 1 : id;
window.display = (id) => id > 0 ? id - 1 : id;
window.load = async (gameState) => {
    tiles.value.clearTiles();
    return setGameState(loadGame(gameState));
};
window.save = () => JSON.stringify(game.state);
window.drawTiles = async (...args) => {
    const result = window.game.drawTiles(...args);
    await placeAllTiles();
    return result;
};

window.player2 = (state) => minimaxBot(state, 2, 10);

window.player1 = async (...args) => {
    if (!window.player2) {
        return { success: false, message: 'player 2 not registered' }
    }
    if (game.state.currentPlayerIndex !== 0) {
        return { success: false, message: 'not your turn!!!!' }
    }
    const result = window.game.drawTiles(...args);
    await placeAllTiles();
    if (result.success) {
        setTimeout(async () => {
            const move = window.player2(game.state);
            const result = await drawTiles(move.displayId, move.colourId, move.lineId);
            if (!result.success) {
                console.warn('Bot move failed: ', result);
            }
        }, 100);
    }
    return result;
}

provide('game', game);

onMounted(() => {
    placeAllTiles();
});

window.addEventListener('resize', placeAllTiles);

async function placeAllTiles() {
    if (!tiles.value || midPlacement) {
        return;
    }
    try {
        midPlacement = true;
        const rerender = discardedTilesSize.value !== game.state.discardedTiles.length
            || centerSize.value !== game.state.centerOfTable.length
            || players.value.length !== game.state.players.length;
        discardedTilesSize.value = game.state.discardedTiles.length;
        centerSize.value = game.state.centerOfTable.length;
        currentPlayerIndex.value = game.state.currentPlayerIndex;
        players.value = game.state.players.map(player => ({
            index: player.index,
            name: player.name,
            score: player.score,
        }));
        if (rerender) {
            await nextTick();
        }
        const promises = [];
        for (const player of game.state.players) {
            const board = playerBoards.value[player.index];
            promises.push(...player.patternLines.map((line, index) =>
                setPlayerLineTiles(board, line, index, false)
            ));
            promises.push(...player.wall.map((line, index) =>
                setPlayerLineTiles(board, line, index, true)
            ));
            promises.push(setPlayerLineTiles(board, player.floorLine, -1, false));
        }

        const slotPositions = discardedTiles.value.getSlotPositions();
        promises.push(...game.state.discardedTiles.map(
            (tile, tileIndex) => setTile(tile, slotPositions[tileIndex], true)
        ));

        promises.push(...game.state.tileBag.map(
            tile => setTile(tile, { x: 0, y: 0 }, false)
        ));

        const centerSlotPositions = tableCenter.value.getSlotPositions();
        promises.push(...game.state.centerOfTable.map(
            (tile, tileIndex) => setTile(tile, centerSlotPositions[tileIndex], true)
        ));

        promises.push(...factoryDisplays.value.map((display, displayIndex) => {
            const slotPositions = display.getSlotPositions();
            return Promise.allSettled(game.state.factoryDisplays[displayIndex].map(
                (tile, tileIndex) => setTile(tile, slotPositions[tileIndex], true)
            ));
        }));

        await Promise.allSettled(promises);
    }
    finally {
        midPlacement = false;
    }
}

async function setPlayerLineTiles(board, line, lineIndex, isWall) {
    if (!line.some(tile => tile)) {
        return;
    }
    const slotPositions = board.getSlotPositions(lineIndex, isWall);
    return Promise.allSettled(line.map(
        (tile, tileIndex) => setTile(tile, slotPositions[tileIndex], true)
    ));
}

function setTile(tile, position, isVisible = true) {
    if (!tile) {
        return;
    }
    return tiles.value.setTile(tile, { position, isVisible });
}

async function setGameState(state) {
    game.state = state;
    return placeAllTiles();
}

function tileSelect(tileId) {
    selectedTileId = tileId;
}

async function lineSelect(lineId, playerId) {
    if (!selectedTileId || playerId !== currentPlayerIndex.value) {
        return;
    }
    const tileAndDisplay = findDisplayTile(selectedTileId);
    if (!tileAndDisplay) {
        return;
    }
    const result = await drawTiles(tileAndDisplay.displayId, tileAndDisplay.tile.colourId, lineId);
    console.info(result);
    return result;
}

function findDisplayTile(tileId) {
    for (let i = 0; i < game.state.factoryDisplays.length; i++) {
        const tile = game.state.factoryDisplays[i].find(t => t.id === tileId);
        if (tile) {
            return {tile, displayId: i};
        }
    }
    const tile = game.state.centerOfTable.find(t => t.id === tileId);
    if (tile?.colourId >= 0) {
        return {tile, displayId: -1};
    }
    return null;
}
</script>

<template>
    <tiles ref="tiles" @mounted="placeAllTiles" @tile-click="tileSelect"/>
    <board
        v-for="player of players"
        :player="player"
        :is-current="currentPlayerIndex === player.index"
        ref="playerBoards"
        :key="player.index"
        @line-click="lineSelect($event, player.index)"
    />
    <div style="display: flex; gap: var(--a-gap); margin: var(--a-gap); flex-wrap: wrap;">
        <factory-display
            v-for="_ in game.state.factoryDisplays.length"
            ref="factoryDisplays"
            :size="game.state.rules.tilesPerFactoryDisplay"
        />
    </div>

    <factory-display
        style="margin: var(--a-gap)"
        class="a-table-center"
        ref="tableCenter"
        :size="centerSize"
    />

    <factory-display
        style="margin: var(--a-gap)"
        class="a-discarded-tiles"
        ref="discardedTiles"
        :size="discardedTilesSize"
    />
</template>
