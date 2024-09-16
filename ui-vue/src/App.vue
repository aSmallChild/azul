<script setup>
import Board from './components/Board.vue';
import Tiles from './components/Tiles.vue';
import { nextTick, onMounted, provide, ref } from 'vue';
import { addPlayer, dealTilesToFactoryDisplays, fillTileBag } from 'azul/functions/gameStandard.js';
import loadGame from 'azul/functions/loadGame.js';
import { createGameState, createPlayer } from 'azul/models/game.js';
import FactoryDisplay from './components/FactoryDisplay.vue';
import emitter from 'azul/models/emitter.js';
import createGameApi from 'azul/models/api.js';
import { getColourByName } from './util/colours.js';

// todo
// - there is a bug where tiles are not rendered on the wall correctly
// - there is a bug where the start tile is not returned to the center of the table

const currentPlayerIndex = ref(0)
const highlight = ref({});
const playerBoards = ref();
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
emitter(game);
setGameState(game.state);

addPlayer(game.state, createPlayer({ name: 'PLAYER ONE' }));
addPlayer(game.state, createPlayer({ name: 'PLAYER 2' }));
// addPlayer(game.state, createPlayer({ name: 'PLAYER THREE' }));
// addPlayer(game.state, createPlayer({ name: 'Bob' }));
fillTileBag(game.state);
dealTilesToFactoryDisplays(game.state);
window.game = createGameApi(game);
window.colour = (name) => getColourByName(name, game.state.rules.numberOfColours);
window.row = (id) => id > 0 ? id - 1 : id;
window.display = (id) => id > 0 ? id - 1 : id;
window.load = async (gameState) => {
    setGameState(loadGame(gameState));
    tiles.value.clearTiles();
    await placeAllTiles();
};
window.save = () => JSON.stringify(game.state);
window.drawTiles = (...args) => window.game.drawTiles(...args);

provide('game', game);

onMounted(() => {
    placeAllTiles();
});

window.addEventListener('resize', placeAllTiles);

async function placeAllTiles() {
    if (!tiles.value) {
        return;
    }
    const rerender = discardedTilesSize.value !== game.state.discardedTiles.length
        || centerSize.value !== game.state.centerOfTable.length;
    discardedTilesSize.value = game.state.discardedTiles.length;
    centerSize.value = game.state.centerOfTable.length;
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

function setGameState(state) {
    game.state = state;
    game.state.emit = (eventName, eventData) => {
        if (eventName === 'player-turn' || eventName === 'game-over') {
            currentPlayerIndex.value = game.state.currentPlayerIndex;
            placeAllTiles();
        }
        game.emit(eventName, eventData);
    };
    currentPlayerIndex.value = game.state.currentPlayerIndex;
}
</script>

<template>
    <tiles ref="tiles" @mounted="placeAllTiles"/>
    <board
        v-for="player of game.state.players"
        :player="player"
        :is-current="currentPlayerIndex === player.index"
        ref="playerBoards"
        :key="player.index"
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
