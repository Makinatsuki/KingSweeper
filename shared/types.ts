export enum CellState {
    HIDDEN = 0,
    REVEALED = 1,
    FLAGGED = 2
}

export interface Vector2 {
    x: number;
    y: number;
}

export type MoveType = 'move' | 'flag';

export interface MovePacket {
    from: Vector2;
    to: Vector2;
    type: MoveType;
}

export interface SyncPacket {
    x: number;
    y: number;
    state: CellState;
    mineCount?: number;
    piece?: string; // e.g., 'white_rook'
}
