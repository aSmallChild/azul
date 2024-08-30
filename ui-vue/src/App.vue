<script setup>
import Board from './components/Board.vue';
import Tiles from './components/Tiles.vue';
import { provide, ref, onMounted } from 'vue';
import { addPlayer, dealTilesToFactoryDisplays, fillTileBag } from 'azul/functions/gameStandard.js';
import { createGameState, createPlayer } from 'azul/models/game.js';
import FactoryDisplay from './components/FactoryDisplay.vue';

const highlight = ref({});
const factoryDisplays = ref();
const tiles = ref();
const game = {
    state: createGameState(),
    highlight,
    listeners: new Map(),
    emit(eventName, data) {
        (this.listeners.get(eventName) ?? []).forEach(handler => {
            try {
                handler(data);
            }
            catch (e) {
                console.error('Event handler error', eventName, e, handler, data);
            }
        })
    },
    on(eventName, handler) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName).push(handler);
    }
};

addPlayer(game.state, createPlayer({ name: 'PLAYER ONE' }));
addPlayer(game.state, createPlayer({ name: 'PLAYER 2' }));
addPlayer(game.state, createPlayer({ name: 'PLAYER THREE' }));
addPlayer(game.state, createPlayer({ name: 'Bob' }));
fillTileBag(game.state);
dealTilesToFactoryDisplays(game.state);

provide('game', game);

onMounted(() => {
    factoryDisplays.value.forEach((display, displayIndex) => {
        const slotPositions = display.getSlotPositions()
        slotPositions.forEach((position, slotIndex) => {
            const tile = game.state.factoryDisplays[displayIndex][slotIndex];
            if (!tile) {
                return;
            }

            tiles.value.setTile(tile, {
                position
            })
        });

    });
});
</script>

<template>
    <tiles ref="tiles"/>
    <board v-for="player of game.state.players" :player="player"/>
    <div style="display: flex; gap: var(--a-gap); margin: var(--a-gap)">
        <factory-display
            v-for="_ in game.state.factoryDisplays.length"
            ref="factoryDisplays"
            :size="game.state.rules.tilesPerFactoryDisplay"
        />
    </div>
</template>
