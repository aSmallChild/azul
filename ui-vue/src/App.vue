<script setup>
import Board from './components/Board.vue';
import Tiles from './components/Tiles.vue';
import { provide, ref } from 'vue';

const highlightLineIndex = ref(null);
const game = {
    highlightLineIndex,
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
}

provide('game', game);
</script>

<template>
    <tiles/>
    <board/>
</template>
