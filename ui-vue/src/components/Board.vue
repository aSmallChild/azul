<script setup>
import { inject, ref, watch } from 'vue';
import { getHexColour } from '../util/colours.js';
import { getColourForWallPosition } from 'azul/functions/gameStandard.js';
import { getSlotPositions } from '../util/slots.js';

const props = defineProps({
    player: {
        type: Object,
        required: true
    },
    isCurrent: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(['line-click']);
const game = inject('game');
const patternLineRefs = ref(null);
const wallLineRefs = ref(null);
const floorLineRef = ref(null);
const { numberOfColours } = game.state.rules;
const patternLines = Array.from({ length: numberOfColours },
    (_, i) => Array.from({ length: i + 1 }, () => 1)
);

const wall = Array.from({ length: numberOfColours },
    (_, x) => Array.from({ length: numberOfColours }, (_, y) => getColourForWallPosition(game.state, x, y))
);

const floorLine = game.state.rules.floorLinePenalties;

const vTileLine = {
    mounted(element, binding) {
        const lineIndex = binding.value;
        watch(() => game.highlight.value, newValue => {
            if (newValue?.playerIndex === props.player.index && newValue?.lineIndex === lineIndex) {
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
        element.addEventListener('click', () => emit('line-click', lineIndex));
    }
}

defineExpose({
    getSlotPositions(lineIndex, isWall = false) {
        return getSlotPositionsFromLine(lineIndex, isWall);
    },
});

function getSlotPositionsFromLine(lineIndex, isWall = false) {
    const line = getLineRef(lineIndex, isWall);
    return getSlotPositions(line.children);
}

function getLineRef(lineIndex, isWall) {
    if (lineIndex < 0) {
        return floorLineRef.value;
    }

    return (isWall ? wallLineRefs : patternLineRefs).value[lineIndex];
}

function emitDragEvent(eventName, lineIndex, event) {
    game.emit(eventName, { playerIndex: props.player.index, lineIndex, event, getSlotPositions: getSlotPositionsFromLine });
}
</script>

<template>
    <div class="a-board" style="display: inline-flex; flex-direction: column" :class="{'a-current-player': isCurrent}">
        <div style="display: flex">
            <div class="a-tile-lines a-pattern-lines">
                <div class="a-tile-line" v-for="(line, lineIndex) of patternLines" ref="patternLineRefs" v-tile-line="lineIndex">
                    <div class="a-tile-slot" v-for="_ of line"></div>
                    <div v-if="lineIndex === 0" style="color: #300; flex: 1">
                        {{ player.name }}<br>
                        SCORE: {{ player.score }}
                    </div>
                </div>
            </div>
            <div class="a-tile-lines">
                <div class="a-tile-line" v-for="line of wall" ref="wallLineRefs">
                    <div class="a-tile-slot" v-for="colour of line"
                         :style="{'--a-tile-slot-colour': getHexColour(colour) + '2'}">
                    </div>
                </div>
            </div>
        </div>
        <div class="a-floor-line" style="flex-direction: row" ref="floorLineRef" v-tile-line="-1">
            <div v-for="points in floorLine" style="text-align: center">
                <div class="a-tile-slot">
                </div>
                {{ points }}
            </div>
        </div>
    </div>
</template>
