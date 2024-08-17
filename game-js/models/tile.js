export default class Tile {
    constructor(id, colourId, meta = {}) {
        this.id = id;
        this.colourId = colourId;
        this.meta = meta;
    }

    toJSON() {
        return {
            id: this.id,
            colourId: this.colourId
        }
    }
}

export function createTile() {
    return new Tile(...arguments);
}
