<script setup>
import { getSlotPositions } from '../util/slots.js';
import { computed, ref } from 'vue';

const props = defineProps({
    size: {
        type: Number,
        required: true,
    }
});
const display = ref();
const slotWidth = computed(() => Math.ceil(Math.sqrt(props.size)));

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
