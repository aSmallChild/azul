<script setup>
import { getSlotPositions } from '../util/slots.js';
import { ref } from 'vue';

const display = ref();
const props = defineProps({
    size: {
        type: Number,
        required: true,
    }
});

const slotWidth = Math.ceil(Math.sqrt(props.size))

defineExpose({
    getSlotPositions() {
        return getSlotPositions(display.value.firstElementChild.children);
    }
});
</script>

<template>
    <div class="a-factory-display" ref="display" :style="`--a-slots-x: ${slotWidth}`">
        <div>
            <div v-for="_ in size" class="a-tile-slot"></div>
        </div>
    </div>
</template>
