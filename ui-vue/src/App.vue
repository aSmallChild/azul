<script setup>
import Board from './components/Board.vue';
import Tiles from './components/Tiles.vue';
import { provide, ref } from 'vue';
import { addPlayer } from 'azul/functions/gameStandard.js';
import { createGameState, createPlayer } from 'azul/models/game.js';
import FactoryDisplay from './components/FactoryDisplay.vue';

const highlight = ref({ });
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
                console.error('Event handler error', e);
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

addPlayer(game.state, createPlayer({name: 'PLAYER ONE'}));
addPlayer(game.state, createPlayer({name: 'PLAYER 2'}));
addPlayer(game.state, createPlayer({name: 'PLAYER THREE'}));
addPlayer(game.state, createPlayer({name: 'Bob'}));

provide('game', game);
</script>

<template>
    <tiles/>
    <board v-for="player of game.state.players" :player="player"/>
    <div style="display: flex; gap: var(--a-gap); margin: var(--a-gap)">
        <factory-display :size="4" v-for="_ in game.state.factoryDisplays.length"></factory-display>
    </div>
</template>
