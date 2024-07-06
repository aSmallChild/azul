<script setup>

import { ref } from 'vue';

const gameState = ref({
 tiles: [],
});

function addTile(colour, location = {
  parentArray: [],
  parentType: 'factory' || 'table' || 'pattern' || 'floor' || 'wall',
  parentIndex: 0,
  playerIndex: 0,
  tileIndex: 0,
}) {

}

</script>

<template>
<div class="a-tiles"></div>
</template>

<style>
.a-tiles {
  position: absolute;
  width: 100vw;
  height: 100vh;
}
</style>
