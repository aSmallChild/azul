<script setup>
import Board from './components/Board.vue';
import Tiles from './components/Tiles.vue';
import { nextTick, onMounted, provide, ref } from 'vue';
import { addPlayer, dealTilesToFactoryDisplays, fillTileBag } from 'azul/functions/gameStandard.js';
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
window.cheat = (gameState) => {
    setGameState(gameState)
    placeAllTiles();
}
window.getGameState = () => window.game.getState();
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
    discardedTilesSize.value = game.state.discardedTiles.length;
    if (centerSize.value !== game.state.centerOfTable.length) {
        centerSize.value = game.state.centerOfTable.length;
        discardedTilesSize.value = game.state.discardedTiles.length;
        await nextTick();
    }
    const centerSlotPositions = tableCenter.value.getSlotPositions()
    game.state.centerOfTable.forEach(
        (tile, tileIndex) => setTile(tile, centerSlotPositions[tileIndex])
    );

    factoryDisplays.value.forEach((display, displayIndex) => {
        const slotPositions = display.getSlotPositions();
        game.state.factoryDisplays[displayIndex]
            .forEach((tile, tileIndex) => setTile(tile, slotPositions[tileIndex]))
    });

    for (const player of game.state.players) {
        const board = playerBoards.value[player.index];
        player.patternLines.forEach((line, index) =>
            setPlayerLineTiles(board, line, index, false)
        );
        player.wall.forEach((line, index) =>
            setPlayerLineTiles(board, line, index, true)
        );
        setPlayerLineTiles(board, player.floorLine, -1, false);
    }

    const slotPositions = discardedTiles.value.getSlotPositions();
    game.state.discardedTiles
        .forEach((tile, tileIndex) => setTile(tile, slotPositions[tileIndex]));

    game.state.tileBag.forEach(tile => setTile(tile, { x: 0, y: 0 }, false));
}

function setPlayerLineTiles(board, line, lineIndex, isWall) {
    if (!line.some(tile => tile)) {
        return;
    }
    const slotPositions = board.getSlotPositions(lineIndex, isWall);
    line.forEach((tile, tileIndex) => setTile(tile, slotPositions[tileIndex]));
}

function setTile(tile, position, isVisible = true) {
    if (!tile) {
        return;
    }
    tiles.value.setTile(tile, { position, isVisible });
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
    // todo clear all tiles previously rendered
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
