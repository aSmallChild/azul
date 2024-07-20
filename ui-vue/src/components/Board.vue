<script setup>
import { inject, ref, watch } from 'vue';
import { getHexColour } from '../util/colours.js';

const game = inject('game');
const patternLineRefs = ref(null);
const wallLineRefs = ref(null);
const floorLineRef = ref(null);
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
const floorLine = [-1, -1, -2, -2, -2, -2, -3, -3];

const vTileLine = {
    mounted(element, binding) {
        const lineIndex = binding.value;
        watch(() => game.highlightLineIndex.value, newIndex => {
           if (newIndex === lineIndex) {
               element.classList.add('a-dropzone');
           }
           else {
               element.classList.remove('a-dropzone');
           }
        });
        element.addEventListener('dragenter', event => {
            event.stopPropagation();
            emitDragEvent('line-drag-enter', lineIndex, event);
        });
        element.addEventListener('dragleave', event => {
            event.stopPropagation();
            emitDragEvent('line-drag-leave', lineIndex, event);
        });
        element.addEventListener('drop', event => {
            event.stopPropagation();
            emitDragEvent('line-drop', lineIndex, event);
        });
    }
}

function getSlotPositions(lineIndex, isWall = false) {
    const line = getLineRef(lineIndex, isWall);
    const positions = [];
    for (const slot of line.children) {
        const rect = slot.getBoundingClientRect();
        positions.push({ x: rect.left, y: rect.top });
    }
    return positions;
}

function getLineRef(lineIndex, isWall) {
    if (lineIndex < 0) {
        return floorLineRef.value;
    }

    return (isWall ? wallLineRefs : patternLineRefs).value[lineIndex];
}

function emitDragEvent(eventName, lineIndex, event) {
    game.emit(eventName, { lineIndex, event, getSlotPositions });
}
</script>

<template>
    <div class="a-board" style="display: inline-flex; flex-direction: column">
        <div style="display: flex">
            <div class="a-tile-lines">
                <div class="a-tile-line" v-for="(line, lineIndex) of patternLines" ref="patternLineRefs" v-tile-line="lineIndex">
                    <div class="a-tile-slot" v-for="_ of line"></div>
                    <div v-if="lineIndex === 0" style="color: #300; flex: 1">
                        PLAYER NAME<br>
                        SCORE: 0
                    </div>
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
        <div class="a-floor-line" style="flex-direction: row" ref="floorLineRef" v-tile-line="-1">
            <div v-for="slot in floorLine" style="text-align: center">
                <div class="a-tile-slot">
                </div>
                {{ slot }}
            </div>
        </div>
    </div>
</template>
