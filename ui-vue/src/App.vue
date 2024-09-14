<script setup>
import Board from './components/Board.vue';
import Tiles from './components/Tiles.vue';
import { onMounted, provide, ref } from 'vue';
import { addPlayer, dealTilesToFactoryDisplays, fillTileBag } from 'azul/functions/gameStandard.js';
import { createGameState, createPlayer } from 'azul/models/game.js';
import FactoryDisplay from './components/FactoryDisplay.vue';
import emitter from 'azul/models/emitter.js';
import createGameApi from 'azul/models/api.js';

const highlight = ref({});
const playerBoards = ref();
const factoryDisplays = ref();
const tableCenter = ref();
const centerSize = ref(1);
const tiles = ref();
const game = {
    state: createGameState(),
    highlight
};
emitter(game);
game.state.emit = (eventName, eventData) => {
    if (eventName === 'player-turn' || eventName === 'game-over') {
        placeAllTiles();
    }
    game.emit(eventName, eventData);
};

addPlayer(game.state, createPlayer({ name: 'PLAYER ONE' }));
addPlayer(game.state, createPlayer({ name: 'PLAYER 2' }));
addPlayer(game.state, createPlayer({ name: 'PLAYER THREE' }));
addPlayer(game.state, createPlayer({ name: 'Bob' }));
fillTileBag(game.state);
dealTilesToFactoryDisplays(game.state);
window.game = createGameApi(game);

provide('game', game);

onMounted(() => {
    placeAllTiles();
});

window.addEventListener('resize', placeAllTiles);

function placeAllTiles() {
    if (!tiles.value) {
        return;
    }
    centerSize.value = game.state.centerOfTable.length;
    tableCenter.value.getSlotPositions()
        .forEach((position, slotIndex) => {
            const tile = game.state.centerOfTable[slotIndex];
            if (tile) {
                tiles.value.setTile(tile, { position });
            }
        });

    factoryDisplays.value.forEach((display, displayIndex) => {
        const slotPositions = display.getSlotPositions();
        slotPositions.forEach((position, slotIndex) => {
            const tile = game.state.factoryDisplays[displayIndex][slotIndex];
            if (tile) {
                tiles.value.setTile(tile, { position });
            }
        });
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
}

function setPlayerLineTiles(board, line, lineIndex, isWall) {
    if (!line.some(tile => tile)) {
        return;
    }
    const slotPositions = board.getSlotPositions(lineIndex, isWall);
    line.forEach((tile, tileIndex) => {
        if (!tile) {
            return;
        }
        tiles.value.setTile(tile, { position: slotPositions[tileIndex] });
    });
}
</script>

<template>
    <tiles ref="tiles" @mounted="placeAllTiles"/>
    <board
        v-for="player of game.state.players"
        :player="player"
        ref="playerBoards"
        :key="player.index"
    />
    <div style="display: flex; gap: var(--a-gap); margin: var(--a-gap)">
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
</template>
