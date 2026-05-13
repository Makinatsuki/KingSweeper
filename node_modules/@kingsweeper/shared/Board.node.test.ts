import { test } from 'node:test';
import assert from 'node:assert';
import { Board, BOARD_SIZE } from './Board.js';
import { Piece } from './Piece.js';

test('Board initialization', () => {
    const board = new Board();
    assert.strictEqual(board.tiles.length, BOARD_SIZE);
    assert.strictEqual(board.tiles[0].length, BOARD_SIZE);
});

test('Reveal tiles correctly', () => {
    const board = new Board();
    board.revealTile(10, 10);
    assert.strictEqual(board.tiles[10][10].revealed, true);
});

test('Adjacent mines calculation', () => {
    const board = new Board();
    board.tiles[0][0].hasMine = true;
    board.tiles[0][1].hasMine = true;
    
    // Knight value is 3
    board.pieces.push(new Piece('Knight', 'Black', 1, 1));
    // Adjacent to (1,0) are (0,0), (0,1), (1,1), (2,0), (2,1)
    // Mine at (0,0) -> +1
    // Mine at (0,1) -> +1
    // Knight at (1,1) -> +3
    // Total = 5
    assert.strictEqual(board.countAdjacentMines(1, 0), 5);

    // Replace Knight with King (value -1)
    board.pieces = [new Piece('King', 'Black', 1, 1)];
    // Total = 1 + 1 - 1 = 1
    assert.strictEqual(board.countAdjacentMines(1, 0), 1);
});

test('Rook movement', () => {
    const board = new Board();
    const rook = new Piece('Rook', 'White', 5, 5);
    board.pieces.push(rook);
    
    // Rook at 5,5. Tiles are hidden by default.
    // White pieces can move ONTO one hidden tile, but not THROUGH it.
    board.tiles[5][6].revealed = true;
    board.tiles[5][7].revealed = true;
    board.tiles[6][5].revealed = true;
    
    // Moves:
    // [1,0]: (6,5) revealed, can continue. (7,5) hidden, stops. -> 2 moves
    // [-1,0]: (4,5) hidden, stops. -> 1 move
    // [0,1]: (5,6) revealed, (5,7) revealed, (5,8) hidden, stops. -> 3 moves
    // [0,-1]: (5,4) hidden, stops. -> 1 move
    // Total = 7
    
    const moves = board.getLegalMoves(rook, 'White');
    assert.strictEqual(moves.length, 7);
});

test('Black piece movement - Boundary Rule', () => {
    const board = new Board();
    const rook = new Piece('Rook', 'Black', 5, 5);
    board.pieces.push(rook);
    
    // Boundary Rule: Sliding black pieces starting from hidden tile 
    // cannot move to revealed tile unless they are at the boundary.
    
    // Make sure we are NOT at boundary (all neighbors hidden)
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            board.tiles[5 + i][5 + j].revealed = false;
        }
    }
    
    // Reveal a tile further away
    board.tiles[5][10].revealed = true;
    
    const moves = board.getLegalMoves(rook, 'Black');
    // Should NOT be able to move to (5,10) because it's revealed and we started in hidden and not at boundary
    assert.ok(!moves.some(m => m.x === 5 && m.y === 10));
});

test('Win condition - White wins', () => {
    const board = new Board();
    board.initialize();
    board.gameStarted = true;
    
    // Add white king
    board.pieces.push(new Piece('King', 'White', 0, 0));
    
    // Remove black king
    board.pieces = board.pieces.filter(p => !(p.type === 'King' && p.color === 'Black'));
    
    const result = board.checkWin();
    assert.strictEqual(result.winner, 'White');
});
