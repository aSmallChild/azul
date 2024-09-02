export function getSlotPositions(slots) {
    const positions = [];
    const bodyRect = document.body.getBoundingClientRect();
    for (const slot of slots) {
        const rect = slot.getBoundingClientRect();
        positions.push({ x: rect.left - bodyRect.left, y: rect.top - bodyRect.top });
    }
    return positions;
}
