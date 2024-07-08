<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { animate } from 'motion'

const gameState = ref({
    tiles: [],
});

const tileRefs = ref();
const tiles = [];
const hexColours = [
    { id: 0, hex: '#05c', name: 'blue' },
    { id: 1, hex: '#3de', name: 'light blue' },
    { id: 2, hex: '#222', name: 'black' },
    { id: 3, hex: '#f00', name: 'red' },
    { id: 4, hex: '#d90', name: 'yellow' },
];
const draggedTiles = [];
let currentAnimations = [];
let tileSpacing = 20;

addTile('asd', 0);
addTile('asdf', 0);
addTile('asdg', 1);
addTile('asdh', 2);
addTile('asdj', 2);
addTile('asd6', 2);
addTile('asdjs', 3);
addTile('asdjaf', 3);

function getColour(tileColour) {
    return hexColours?.[tileColour] ?? '#fff';
}

function addTile(id, colourId) {
    tiles.push({
        id, colour: getColour(colourId), index: tiles.length,
        element: null
    });
}

// function addTile(colour, location = {
//   parentArray: [],
//   parentType: 'factory' || 'table' || 'pattern' || 'floor' || 'wall',
//   parentIndex: 0,
//   playerIndex: 0,
//   tileIndex: 0,
// }) {
//
// }

onMounted(() => {
    document.body.addEventListener('dragover', dragOver);
    document.body.draggable = false;
});

onUnmounted(() => {
    document.body.removeEventListener('dragover', dragOver);
});


async function doThings(event, tile) {
    await animate(tile.element, { x: '50px', y: '50px' }).finished;
    await animate(tile.element, { x: `${event.clientX - 22}px`, y: `${event.clientY - 22}px` }).finished;
    await animate(tile.element, { x: `${event.clientX * 2 - 22}px`, y: `${event.clientY * 2 - 22}px` }).finished;
}

function dragStart(event, tile) {
    event.dataTransfer.setDragImage(document.createElement('div'), 0, 0);
    draggedTiles.splice(0, draggedTiles.length);
    draggedTiles.push(tile);
    tile.element = tileRefs.value[tile.index];
    tile.element.style.pointerEvents = 'none';
    tileSpacing = tile.element.clientWidth / (2.75 / 4);
    tiles.forEach(otherTile => {
        if (otherTile === tile) {
            return;
        }
        if (tile.colour === otherTile.colour) {
            otherTile.element = tileRefs.value[otherTile.index];
            draggedTiles.push(otherTile);
            otherTile.element.style.pointerEvents = 'none';
        }
    });
    event.dataTransfer.setData('text/plain', `${draggedTiles.length} ${tile.colour.name} tile(s)`);
    event.dataTransfer.setData('application/json', JSON.stringify(
        draggedTiles.map(tile => ({ id: tile.id, colourId: tile.colour.id, index: tile.index }))
    ));
    drag({ x: event.clientX, y: event.clientY, duration: 0.15, timeStamp: event.timeStamp });
}

function dragOver(event) {
    drag({ x: event.pageX, y: event.pageY, timeStamp: event.timeStamp });
}

function dragEnd(event) {
    draggedTiles.forEach(tile => tile.element.style.pointerEvents = '');
}

async function drag(event) {
    const { x, y, duration = 0.05, timeStamp } = event;
    if (timeStamp < currentAnimations.at(-1)) {
        return;
    }
    await Promise.all(currentAnimations);
    currentAnimations = draggedTiles.map((tile, index) => {
        const offset = tileSpacing * index - 20;
        return animate(tile.element,
            { x: `${x + offset}px`, y: `${y - 22}px` },
            { duration, easing: 'linear' }
        ).finished;
    });
    currentAnimations.push(timeStamp);
}
</script>

<template>
    <div class="a-tiles" @dragover="dragOver">
        <i v-for="tile of tiles" :key="tile.id"
           :data-id="tile.id" ref="tileRefs"
           class="a-tile" :style="`--a-tile-colour: ${tile.colour.hex}`"
           draggable="true" @dragstart="dragStart($event, tile)" @dragend="dragEnd"
        />
    </div>
</template>