<script setup>
import { inject, ref } from 'vue';
import { getHexColour } from '../util/colours.js';

const game = inject('game');
const patternLineRefs = ref(null);
const wallLineRefs = ref(null);
const patternLines = [
    [1],
    [1, 1],
    [1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1, 1],
];
const wall = [
    [1, 2, 3, 4, 0],
    [2, 3, 4, 0, 1],
    [3, 4, 0, 1, 2],
    [4, 0, 1, 2, 3],
    [0, 1, 2, 3, 4],
];

function getSlotPositions(lineIndex, isWall = false) {
    const line = patternLineRefs.value[lineIndex];
    const positions = [];
    for (const slot of line.children) {
        const rect = slot.getBoundingClientRect();
        positions.push({ x: rect.left, y: rect.top });
    }
    return positions;
}

function emitDragEvent(eventName, lineIndex, event) {
    game.emit(eventName, { lineIndex, event, getSlotPositions });
}
</script>

<template>
    <div class="a-board">
        <div class="a-tile-lines">
            <div class="a-tile-line" v-for="(line, lineIndex) of patternLines" ref="patternLineRefs"
                 :class="{'a-dropzone': game.highlightLineIndex.value === lineIndex}"
                 @dragenter="emitDragEvent('line-drag-enter', lineIndex, $event)"
                 @dragover="emitDragEvent('line-drag-over', lineIndex, $event)"
                 @dragleave="emitDragEvent('line-drag-leave', lineIndex, $event)"
                 @dragend="emitDragEvent('line-drag-leave', lineIndex, $event)"
                 @drop="emitDragEvent('line-drop', lineIndex, $event)"
            >
                <div class="a-tile-slot" v-for="_ of line"></div>
            </div>
        </div>
        <div class="a-tile-lines">
            <div class="a-tile-line" v-for="line of wall" ref="wallLineRefs">
                <div class="a-tile-slot" v-for="colour of line"
                     :style="{'--a-tile-slot-colour': getHexColour(colour) + '5'}">
                </div>
            </div>
        </div>
    </div>
</template>
