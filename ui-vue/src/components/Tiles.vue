<script setup>
import { inject, onMounted, onUnmounted, ref } from 'vue';
import { animate } from 'motion'
import { getColour } from '../util/colours.js';
import Tile from 'azul/models/tile.js';

const game = inject('game');
const tileRefs = ref();
const tiles = [];
const draggedTiles = [];
let currentAnimations = [];
let tileSpacing = 20;
let hasValidDropzone = false;

addTile('asd', 0);
addTile('asdf', 0);
addTile('asdg', 1);
addTile('asdh', 2);
addTile('asdj', 2);
addTile('asd6', 2);
addTile('asdjs', 3);
addTile('asdjaf', 3);

game.on('line-drag-enter', async ({ lineIndex, playerIndex, event, getSlotPositions }) => {
    if (!isDragging() || !tilesAllowed()) {
        return;
    }
    hasValidDropzone = true;
    game.highlight.value = { lineIndex, playerIndex };
    const duration = 0.15;
    await Promise.all(currentAnimations);
    const slotPositions = getSlotPositions(lineIndex);
    let lastX = event.pageX;
    let lastY = event.pageY;
    currentAnimations = draggedTiles.map((tile, index) => {
        const { x, y } = slotPositions?.[index] ?? { x: lastX, y: lastY };
        const offset = 5;
        return animate(tile.meta.element,
            { x: `${x + offset}px`, y: `${y + offset}px` },
            { duration, easing: 'linear' }
        ).finished;
    });
    currentAnimations.push(event.timeStamp);
});
game.on('line-drag-over', ({ lineIndex, event, getSlotPositions }) => {
    if (!isDragging()) {
        return;
    }
    if (!tilesAllowed()) {
        event.preventDefault();
    }
});
game.on('line-drag-leave', ({ lineIndex, event, getSlotPositions }) => {
    if (!isDragging()) {
        return;
    }
    game.highlight.value = null;
    hasValidDropzone = false;
});
game.on('line-drop', ({ lineIndex, event, getSlotPositions }) => {
    if (!isDragging()) {
        return;
    }
    game.highlight.value = null;
    hasValidDropzone = false;
    dragEnd(event);
});

onMounted(() => {
    document.body.addEventListener('dragover', dragOver);
    document.body.draggable = false;
});

onUnmounted(() => {
    document.body.removeEventListener('dragover', dragOver);
});

function isDragging() {
    return draggedTiles.length > 0;
}

function mouseLeaveWindow(event) {
    if (event.relatedTarget?.nodeName === 'HTML') {
        dragEnd(event);
    }
}

function addTile(id, colourId) {
    tiles.push(new Tile(id, colourId, {
        colour: getColour(colourId), index: tiles.length, element: null
    }));
}

function tilesAllowed() {
    return true;
    // if (!isDragging()) {
    //     return false;
    // }
    //
    // return draggedTiles[0].colour.id === 3;
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

async function doThings(event, tile) {
    await animate(tile.element, { x: '50px', y: '50px' }).finished;
    await animate(tile.element, { x: `${event.clientX - 22}px`, y: `${event.clientY - 22}px` }).finished;
    await animate(tile.element, { x: `${event.clientX * 2 - 22}px`, y: `${event.clientY * 2 - 22}px` }).finished;
}

function dragStart(event, tile) {
    event.dataTransfer.setDragImage(document.createElement('div'), 0, 0);
    draggedTiles.splice(0, draggedTiles.length);
    draggedTiles.push(tile);
    tile.meta.element = tileRefs.value[tile.meta.index];
    tile.meta.element.style.pointerEvents = 'none';
    tileSpacing = tile.meta.element.clientWidth / (2.75 / 4);
    tiles.forEach(otherTile => {
        if (otherTile.id === tile.id) {
            return;
        }
        if (tile.colourId === otherTile.colourId) {
            otherTile.meta.element = tileRefs.value[otherTile.meta.index];
            draggedTiles.push(otherTile);
            otherTile.meta.element.style.pointerEvents = 'none';
        }
    });
    event.dataTransfer.setData('text/plain', `${draggedTiles.length} ${tile.meta.colour.name} tile(s)`);
    event.dataTransfer.setData('application/json', JSON.stringify(
        draggedTiles.map(tile => ({ id: tile.id, colourId: tile.colourId, index: tile.meta.index }))
    ));
    drag({ x: event.clientX, y: event.clientY, duration: 0.15, timeStamp: event.timeStamp });
}

function dragOver(event) {
    if (hasValidDropzone || !isDragging()) {
        return;
    }
    drag({ x: event.pageX, y: event.pageY, timeStamp: event.timeStamp });
}

function dragEnd(event) {
    if (!isDragging()) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    draggedTiles.forEach(tile => tile.meta.element.style.pointerEvents = '');
    draggedTiles.splice(0, draggedTiles.length);
}

async function drag(event) {
    const { x, y, duration = 0.05, timeStamp } = event;
    if (timeStamp < currentAnimations.at(-1)) {
        return;
    }
    await Promise.all(currentAnimations);
    currentAnimations = draggedTiles.map((tile, index) => {
        const offset = tileSpacing * index - 20;
        return animate(tile.meta.element,
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
           class="a-tile" :style="`--a-tile-colour: ${tile.meta.colour.hex}`"
           draggable="true" @dragstart="dragStart($event, tile)" @dragend="dragEnd"
        />
    </div>
</template>
