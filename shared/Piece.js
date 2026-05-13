export class Piece {
    type;
    color;
    gridX;
    gridY;
    hasMoved;
    value;
    constructor(type, color, gridX, gridY, hasMoved = false) {
        this.type = type;
        this.color = color;
        this.gridX = gridX;
        this.gridY = gridY;
        this.hasMoved = hasMoved;
        this.value = this.calculateValue();
    }
    calculateValue() {
        switch (this.type) {
            case 'Queen': return 9;
            case 'Rook': return 5;
            case 'Knight': return 3;
            case 'Bishop': return 3;
            case 'Pawn': return 1;
            case 'King': return -1;
            default: return 0;
        }
    }
    static fromData(data) {
        return new Piece(data.type, data.color, data.gridX, data.gridY, data.hasMoved);
    }
    toData() {
        return {
            type: this.type,
            color: this.color,
            gridX: this.gridX,
            gridY: this.gridY,
            hasMoved: this.hasMoved
        };
    }
}
//# sourceMappingURL=Piece.js.map