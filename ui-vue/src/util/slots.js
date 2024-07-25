export function getSlotPositions(slots) {
    const positions = [];
    for (const slot of slots) {
        const rect = slot.getBoundingClientRect();
        positions.push({ x: rect.left, y: rect.top });
    }
    return positions;
}
