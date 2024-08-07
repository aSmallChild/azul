export default class Tile {
    constructor(id, colourId, meta = {}) {
        this.id = id;
        this.colourId = colourId;
        this.meta = meta;
    }
}
