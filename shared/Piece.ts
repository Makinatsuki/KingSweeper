export type PieceType = 'Pawn' | 'Knight' | 'Bishop' | 'Rook' | 'Queen' | 'King';
export type Color = 'White' | 'Black';

export interface PieceData {
    type: PieceType;
    color: Color;
    gridX: number;
    gridY: number;
    hasMoved: boolean;
}

export class Piece {
    type: PieceType;
    color: Color;
    gridX: number;
    gridY: number;
    hasMoved: boolean;
    value: number;

    constructor(type: PieceType, color: Color, gridX: number, gridY: number, hasMoved: boolean = false) {
        this.type = type;
        this.color = color;
        this.gridX = gridX;
        this.gridY = gridY;
        this.hasMoved = hasMoved;
        this.value = this.calculateValue();
    }

    private calculateValue(): number {
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

    static fromData(data: PieceData): Piece {
        return new Piece(data.type, data.color, data.gridX, data.gridY, data.hasMoved);
    }

    toData(): PieceData {
        return {
            type: this.type,
            color: this.color,
            gridX: this.gridX,
            gridY: this.gridY,
            hasMoved: this.hasMoved
        };
    }
}
