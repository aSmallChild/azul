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
</script>

<template>
  <div class="a-board">
    <div class="a-tile-lines">
      <div class="a-tile-line" v-for="line of patternLines">
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
