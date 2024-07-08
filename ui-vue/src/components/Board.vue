<script setup>

defineProps({
    msg: String,
});

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

const hexColours = [
    '#05c',
    '#3de',
    '#222',
    '#f00',
    '#d90',
];

defineExpose({
    getSlotPosition
})

function getHexColour(tileColour) {
    return hexColours?.[tileColour] ?? '#fff';
}

// slotType (wallLine, patternLine, floorLine)
function getSlotPosition(slotType, lineIndex, tileIndex) {

}

function tilesAllowed(event) {
    const data = event.dataTransfer.getData('application/json');
    if (!data) {
        return false;
    }
    const tiles = JSON.parse(data);
    return tiles[0].colourId === 3;

}

function dragOver(event) {
    if (tilesAllowed(event)) {
        event.preventDefault();
    }
}

function dragEnter(event) {
    if (!tilesAllowed(event)) {
        return;
    }
    event.target.classList.add('a-dropzone');
}

function dragLeave(event) {
    event.target.classList.remove('a-dropzone');
}
</script>

<template>
    <div class="a-board">
        <div class="a-tile-lines">
            <div class="a-tile-line" v-for="line of patternLines" @dragover="dragOver" @dragenter="dragEnter" @dragleave="dragLeave" @dragend="dragLeave" @drop="dragLeave">
                <div class="a-tile-slot" v-for="_ of line"></div>
            </div>
        </div>
        <div class="a-tile-lines">
            <div class="a-tile-line" v-for="line of wall">
                <div class="a-tile-slot" v-for="colour of line"
                     :style="{'--a-tile-slot-colour': getHexColour(colour) + '5'}">
                </div>
            </div>
        </div>
    </div>
</template>
