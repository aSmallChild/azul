<script setup>
import { inject, onMounted, onUnmounted, ref } from 'vue';
import { animate } from 'motion'
import { getColour } from '../util/colours.js';
import { key as metadataKey } from '../util/tile.js';

defineExpose({
    setTile,
    clearTiles
});

const emit = defineEmits(['mounted']);
const tileContainer = ref();
const game = inject('game');
const draggedTiles = [];
let currentAnimations = [];
let tileSpacing = 20;
let hasValidDropzone = false;

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
        return animate(tile.meta[metadataKey].element,
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
    emit('mounted');
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

function tilesAllowed() {
    return true;
    // if (!isDragging()) {
    //     return false;
    // }
    //
    // return draggedTiles[0].colour.id === 3;
}

async function doThings(event, tile) {
    await animate(tile.element, { x: '50px', y: '50px' }).finished;
    await animate(tile.element, { x: `${event.clientX - 22}px`, y: `${event.clientY - 22}px` }).finished;
    await animate(tile.element, { x: `${event.clientX * 2 - 22}px`, y: `${event.clientY * 2 - 22}px` }).finished;
}

function dragStart(event, tile) {
    event.dataTransfer.setDragImage(document.createElement('div'), 0, 0);
    draggedTiles.splice(0, draggedTiles.length);
    draggedTiles.push(tile);
    const metadata = tile.meta[metadataKey];
    const colour = getColour(tile.colourId);
    metadata.element.style.pointerEvents = 'none';
    tileSpacing = metadata.element.clientWidth / (2.75 / 4);
    // todo this tiles component will no longer be responsible for deciding which tiles to include when dragging
    // tiles.forEach(otherTile => {
    //     if (otherTile.id === tile.id) {
    //         return;
    //     }
    //     if (tile.colourId === otherTile.colourId) {
    //         draggedTiles.push(otherTile);
    //         otherTile.meta[metadataKey].element.style.pointerEvents = 'none';
    //     }
    // });
    event.dataTransfer.setData('text/plain', `${draggedTiles.length} ${colour.name} tile(s)`);
    event.dataTransfer.setData('application/json', JSON.stringify(
        draggedTiles.map(tile => ({ id: tile.id, colourId: tile.colourId, index: metadata.index }))
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
    draggedTiles.forEach(tile => tile.meta[metadataKey].element.style.pointerEvents = '');
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
        return animate(tile.meta[metadataKey].element,
            { x: `${x + offset}px`, y: `${y - 22}px` },
            { duration, easing: 'linear' }
        ).finished;
    });
    currentAnimations.push(timeStamp);
}

function createTileElement(tile) {
    const element = document.createElement('i');
    element.setAttribute('data-id', tile.id);
    element.setAttribute('draggable', 'true');
    element.classList.add('a-tile');
    element.style.setProperty('--a-tile-colour', getColour(tile.colourId).hex);
    element.addEventListener('dragstart', event => dragStart(event, tile));
    element.addEventListener('dragend', event => dragEnd(event, tile));
    if (tile.colourId < 0) {
        element.innerHTML = '1<small>st</small>'
    }
    return element;
}

async function setTile(tile, options) {
    if (!tile.meta[metadataKey]) {
        const element = createTileElement(tile);
        tile.meta[metadataKey] = {
            element,
            position: { x: 0, y: 0 },
            isVisible: true,
        };
        tileContainer.value.appendChild(element);
    }
    const element = tile.meta[metadataKey].element;
    if (element.parentElement !== tileContainer.value) {
        tileContainer.value.appendChild(element);
    }
    const {
        isVisible = null,
        position = null,
        startPosition = null
    } = options;
    if (isVisible) {
        element.style['display'] = '';
    }

    const offset = 6;
    if (startPosition) {
        await animate(element,
            { x: `${position.x + offset}px`, y: `${position.y + offset}px` },
            { duration: 0, easing: 'linear' }
        ).finished;
    }
    await animate(element,
        { x: `${position.x + offset}px`, y: `${position.y + offset}px` },
        { duration: 0.15, easing: 'linear' }
    ).finished;

    if (isVisible === false) {
        element.style['display'] = 'none';
    }
}

function clearTiles() {
    tileContainer.value.replaceChildren();
}
</script>

<template>
    <div class="a-tiles" @dragover="dragOver" ref="tileContainer"></div>
</template>
