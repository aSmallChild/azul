export const hexColours = [
    { id: 0, hex: '#05c', name: 'blue' },
    { id: 1, hex: '#3de', name: 'light blue' },
    { id: 2, hex: '#222', name: 'black' },
    { id: 3, hex: '#f00', name: 'red' },
    { id: 4, hex: '#d90', name: 'yellow' },
    { id: 5, hex: '#9d1', name: 'light green' },
    { id: 6, hex: '#160', name: 'green' },
];
const startColour = { id: -1, hex: '#eee', name: 'start' };

export function getHexColour(colourId) {
    return hexColours?.[colourId].hex ?? startColour.hex;
}

export function getColour(colourId) {
    return hexColours?.[colourId] ?? startColour;
}
