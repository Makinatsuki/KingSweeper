import { CellState } from './types';
import { Piece } from './Piece';
export const BOARD_SIZE = 32;
export const MINE_DENSITY = 0.2;
export class Board {
    tiles;
    pieces;
    turn;
    gameStarted;
    constructor() {
        this.tiles = [];
        for (let x = 0; x < BOARD_SIZE; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < BOARD_SIZE; y++) {
                this.tiles[x][y] = {
                    revealed: false,
                    hasMine: false,
                    flagValue: 0,
                    isAntiFlagged: false,
                    mineCount: 0
                };
            }
        }
        this.pieces = [];
        this.turn = 'White';
        this.gameStarted = false;
    }
    initialize() {
        // Clear board
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                this.tiles[x][y].revealed = false;
                this.tiles[x][y].hasMine = false;
                this.tiles[x][y].flagValue = 0;
                this.tiles[x][y].isAntiFlagged = false;
                this.tiles[x][y].mineCount = 0;
            }
        }
        this.pieces = [];
        // Reveal center 8x8 area
        const mid = Math.floor(BOARD_SIZE / 2);
        for (let x = mid - 4; x < mid + 4; x++) {
            for (let y = mid - 4; y < mid + 4; y++) {
                this.tiles[x][y].revealed = true;
            }
        }
        // Place mines
        let mineCount = Math.floor(BOARD_SIZE * BOARD_SIZE * MINE_DENSITY);
        const safeTiles = 8 * 8;
        if (mineCount < BOARD_SIZE * BOARD_SIZE - safeTiles) {
            while (mineCount > 0) {
                const rx = Math.floor(Math.random() * BOARD_SIZE);
                const ry = Math.floor(Math.random() * BOARD_SIZE);
                if (!this.tiles[rx][ry].revealed && !this.tiles[rx][ry].hasMine) {
                    this.tiles[rx][ry].hasMine = true;
                    mineCount--;
                }
            }
        }
        // Spawn Black Pieces on mines
        const allMinePositions = [];
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                if (this.tiles[x][y].hasMine) {
                    allMinePositions.push({ x, y });
                }
            }
        }
        // Shuffle mines
        for (let i = allMinePositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allMinePositions[i], allMinePositions[j]] = [allMinePositions[j], allMinePositions[i]];
        }
        const blackPiecesToSpawn = [
            'King', 'Queen', 'Rook', 'Rook', 'Bishop', 'Bishop', 'Bishop', 'Bishop',
            'Knight', 'Knight', 'Knight', 'Knight', 'Knight', 'Knight', 'Knight', 'Knight',
            'Pawn', 'Pawn', 'Pawn', 'Pawn', 'Pawn', 'Pawn', 'Pawn', 'Pawn', 'Pawn', 'Pawn',
            'Pawn', 'Pawn', 'Pawn', 'Pawn', 'Pawn', 'Pawn', 'Pawn', 'Pawn', 'Pawn', 'Pawn'
        ];
        const numToSpawn = Math.min(allMinePositions.length, blackPiecesToSpawn.length);
        for (let i = 0; i < numToSpawn; i++) {
            const pos = allMinePositions[i];
            this.pieces.push(new Piece(blackPiecesToSpawn[i], 'Black', pos.x, pos.y));
            // In GML, black pieces on mines replace the mine state with hidden_black_piece
            // We'll keep hasMine true but mark it has a piece
            // Actually, the count_adjacent_mines logic in GML treats mines and pieces differently
        }
    }
    getPieceAt(x, y) {
        return this.pieces.find(p => p.gridX === x && p.gridY === y);
    }
    countAdjacentMines(gx, gy) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const nx = gx + i;
                const ny = gy + j;
                if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
                    const piece = this.getPieceAt(nx, ny);
                    if (piece && piece.color === 'Black') {
                        count += piece.value;
                    }
                    else if (this.tiles[nx][ny].hasMine) {
                        count++;
                    }
                }
            }
        }
        return count;
    }
    isKingAdjacent(gx, gy) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const nx = gx + i;
                const ny = gy + j;
                if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
                    const piece = this.getPieceAt(nx, ny);
                    if (piece && piece.type === 'King' && piece.color === 'Black') {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    revealTile(gx, gy) {
        if (gx < 0 || gx >= BOARD_SIZE || gy < 0 || gy >= BOARD_SIZE)
            return;
        const tile = this.tiles[gx][gy];
        if (tile.revealed)
            return;
        tile.revealed = true;
        if (this.countAdjacentMines(gx, gy) === 0 && !this.isKingAdjacent(gx, gy)) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0)
                        continue;
                    this.revealTile(gx + i, gy + j);
                }
            }
        }
    }
    explode(gx, gy) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const nx = gx + i;
                const ny = gy + j;
                if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
                    this.tiles[nx][ny].flagValue = 0;
                    this.tiles[nx][ny].isAntiFlagged = false;
                    const pieceIndex = this.pieces.findIndex(p => p.gridX === nx && p.gridY === ny);
                    if (pieceIndex !== -1) {
                        this.pieces.splice(pieceIndex, 1);
                    }
                    this.tiles[nx][ny].revealed = true;
                }
            }
        }
        this.tiles[gx][gy].hasMine = false;
        this.tiles[gx][gy].revealed = true;
    }
    isWronglyFlagged(gx, gy) {
        const tile = this.tiles[gx][gy];
        if (tile.flagValue === 0 && !tile.isAntiFlagged)
            return false;
        const piece = this.getPieceAt(gx, gy);
        if (piece && piece.color === 'Black') {
            if (piece.type === 'King')
                return !tile.isAntiFlagged;
            return tile.flagValue !== piece.value;
        }
        if (tile.hasMine) {
            return tile.flagValue !== 1;
        }
        return true;
    }
    getLegalMoves(piece, localPov) {
        // Immobilization check
        if (piece.color === 'Black') {
            const tile = this.tiles[piece.gridX][piece.gridY];
            if (piece.type === 'King') {
                if (tile.isAntiFlagged)
                    return [];
            }
            else {
                if (tile.flagValue === piece.value)
                    return [];
            }
        }
        const moves = [];
        const startStateHidden = !this.tiles[piece.gridX][piece.gridY].revealed;
        let isBoundary = false;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0)
                    continue;
                const nx = piece.gridX + i;
                const ny = piece.gridY + j;
                if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
                    if (startStateHidden !== !this.tiles[nx][ny].revealed) {
                        isBoundary = true;
                        break;
                    }
                }
            }
            if (isBoundary)
                break;
        }
        const checkMove = (gx, gy, isSliding) => {
            if (gx < 0 || gx >= BOARD_SIZE || gy < 0 || gy >= BOARD_SIZE)
                return false;
            const targetPiece = this.getPieceAt(gx, gy);
            const targetTile = this.tiles[gx][gy];
            const isHidden = !targetTile.revealed;
            const isFlagged = targetTile.flagValue > 0 || targetTile.isAntiFlagged;
            // Boundary Rule for sliding pieces
            if (isSliding && piece.color === 'Black') {
                if (startStateHidden && !isHidden && !isBoundary)
                    return false;
            }
            if (!targetPiece) {
                if (piece.color === 'White') {
                    if (!isFlagged) {
                        moves.push({ x: gx, y: gy });
                    }
                    return !isHidden;
                }
                else {
                    // Black pieces
                    if ((!isFlagged || this.isWronglyFlagged(gx, gy)) && (isHidden || localPov === 'Black' || targetTile.revealed)) {
                        moves.push({ x: gx, y: gy });
                        if (isSliding && startStateHidden !== isHidden)
                            return false;
                        return true;
                    }
                    return false;
                }
            }
            else {
                if (targetPiece.color !== piece.color) {
                    if (isFlagged && !this.isWronglyFlagged(gx, gy))
                        return false;
                    if (piece.color === 'Black') {
                        if (isSliding && startStateHidden && !isHidden && !isBoundary)
                            return false;
                    }
                    moves.push({ x: gx, y: gy });
                }
                return false;
            }
        };
        switch (piece.type) {
            case 'Rook':
                const rookDirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                for (const d of rookDirs) {
                    for (let j = 1; j < BOARD_SIZE; j++) {
                        if (!checkMove(piece.gridX + d[0] * j, piece.gridY + d[1] * j, true))
                            break;
                    }
                }
                break;
            case 'Bishop':
                const bishopDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
                for (const d of bishopDirs) {
                    for (let j = 1; j < BOARD_SIZE; j++) {
                        if (!checkMove(piece.gridX + d[0] * j, piece.gridY + d[1] * j, true))
                            break;
                    }
                }
                break;
            case 'Queen':
                const queenDirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
                for (const d of queenDirs) {
                    for (let j = 1; j < BOARD_SIZE; j++) {
                        if (!checkMove(piece.gridX + d[0] * j, piece.gridY + d[1] * j, true))
                            break;
                    }
                }
                break;
            case 'Knight':
                const knightDirs = [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]];
                for (const d of knightDirs) {
                    checkMove(piece.gridX + d[0], piece.gridY + d[1], false);
                }
                break;
            case 'King':
                const kingDirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
                for (const d of kingDirs) {
                    checkMove(piece.gridX + d[0], piece.gridY + d[1], false);
                }
                break;
            case 'Pawn':
                const pawnMoveDirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                for (const d of pawnMoveDirs) {
                    const gx = piece.gridX + d[0];
                    const gy = piece.gridY + d[1];
                    if (gx >= 0 && gx < BOARD_SIZE && gy >= 0 && gy < BOARD_SIZE) {
                        const targetPiece = this.getPieceAt(gx, gy);
                        const targetTile = this.tiles[gx][gy];
                        const isHidden = !targetTile.revealed;
                        const isFlagged = targetTile.flagValue > 0 || targetTile.isAntiFlagged;
                        if (!targetPiece) {
                            if (piece.color === 'White' || ((!isFlagged || this.isWronglyFlagged(gx, gy)) && (isHidden || localPov === 'Black' || targetTile.revealed))) {
                                moves.push({ x: gx, y: gy });
                                if (!piece.hasMoved) {
                                    const gx2 = piece.gridX + d[0] * 2;
                                    const gy2 = piece.gridY + d[1] * 2;
                                    if (gx2 >= 0 && gx2 < BOARD_SIZE && gy2 >= 0 && gy2 < BOARD_SIZE) {
                                        const targetPiece2 = this.getPieceAt(gx2, gy2);
                                        const targetTile2 = this.tiles[gx2][gy2];
                                        const isHidden2 = !targetTile2.revealed;
                                        const isFlagged2 = targetTile2.flagValue > 0 || targetTile2.isAntiFlagged;
                                        if (!targetPiece2 && (piece.color === 'White' || ((!isFlagged2 || this.isWronglyFlagged(gx2, gy2)) && (isHidden2 || localPov === 'Black' || targetTile2.revealed)))) {
                                            moves.push({ x: gx2, y: gy2 });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                const pawnCapDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
                for (const d of pawnCapDirs) {
                    const gx = piece.gridX + d[0];
                    const gy = piece.gridY + d[1];
                    if (gx >= 0 && gx < BOARD_SIZE && gy >= 0 && gy < BOARD_SIZE) {
                        const targetPiece = this.getPieceAt(gx, gy);
                        const targetTile = this.tiles[gx][gy];
                        const isHidden = !targetTile.revealed;
                        const isFlagged = targetTile.flagValue > 0 || targetTile.isAntiFlagged;
                        if (targetPiece && targetPiece.color !== piece.color) {
                            if (piece.color === 'White' || ((!isFlagged || this.isWronglyFlagged(gx, gy)) && (isHidden || localPov === 'Black' || targetTile.revealed))) {
                                moves.push({ x: gx, y: gy });
                            }
                        }
                    }
                }
                break;
        }
        return moves;
    }
    getFlaggingSquares(piece) {
        if (piece.color === 'Black')
            return [];
        const moves = [];
        const checkFlag = (gx, gy) => {
            if (gx < 0 || gx >= BOARD_SIZE || gy < 0 || gy >= BOARD_SIZE)
                return false;
            const targetPiece = this.getPieceAt(gx, gy);
            const targetTile = this.tiles[gx][gy];
            const isHidden = !targetTile.revealed;
            if (!targetPiece) {
                moves.push({ x: gx, y: gy });
                return !isHidden;
            }
            else if (targetPiece.color === 'Black') {
                moves.push({ x: gx, y: gy });
                return false;
            }
            return false;
        };
        switch (piece.type) {
            case 'Rook':
                const rookDirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                for (const d of rookDirs) {
                    for (let j = 1; j < BOARD_SIZE; j++) {
                        if (!checkFlag(piece.gridX + d[0] * j, piece.gridY + d[1] * j))
                            break;
                    }
                }
                break;
            case 'Bishop':
                const bishopDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
                for (const d of bishopDirs) {
                    for (let j = 1; j < BOARD_SIZE; j++) {
                        if (!checkFlag(piece.gridX + d[0] * j, piece.gridY + d[1] * j))
                            break;
                    }
                }
                break;
            case 'Queen':
                const queenDirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
                for (const d of queenDirs) {
                    for (let j = 1; j < BOARD_SIZE; j++) {
                        if (!checkFlag(piece.gridX + d[0] * j, piece.gridY + d[1] * j))
                            break;
                    }
                }
                break;
            case 'Knight':
                const knightDirs = [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]];
                for (const d of knightDirs) {
                    checkFlag(piece.gridX + d[0], piece.gridY + d[1]);
                }
                break;
            case 'King':
                const kingDirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
                for (const d of kingDirs) {
                    checkFlag(piece.gridX + d[0], piece.gridY + d[1]);
                }
                break;
            case 'Pawn':
                const pawnDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
                for (const d of pawnDirs) {
                    checkFlag(piece.gridX + d[0], piece.gridY + d[1]);
                }
                break;
        }
        return moves;
    }
    makeMove(from, to, type, localPov) {
        const piece = this.getPieceAt(from.x, from.y);
        if (!piece)
            return false;
        if (this.turn !== piece.color)
            return false;
        if (type === 'flag') {
            const flaggingSquares = this.getFlaggingSquares(piece);
            if (!flaggingSquares.some(s => s.x === to.x && s.y === to.y))
                return false;
            const tile = this.tiles[to.x][to.y];
            if (!tile.isAntiFlagged) {
                if (tile.flagValue === 0)
                    tile.flagValue = 1;
                else if (tile.flagValue === 1)
                    tile.flagValue = 3;
                else if (tile.flagValue === 3)
                    tile.flagValue = 5;
                else if (tile.flagValue === 5)
                    tile.flagValue = 9;
                else if (tile.flagValue === 9) {
                    tile.flagValue = 0;
                    tile.isAntiFlagged = true;
                }
                else {
                    tile.flagValue = 0;
                }
            }
            else {
                tile.isAntiFlagged = false;
                tile.flagValue = 0;
            }
            this.checkWin();
            return true;
        }
        // type === 'move'
        const legalMoves = this.getLegalMoves(piece, localPov);
        if (!legalMoves.some(m => m.x === to.x && m.y === to.y))
            return false;
        const targetPiece = this.getPieceAt(to.x, to.y);
        let exploding = false;
        if (targetPiece) {
            if (targetPiece.color === 'Black' || piece.color === 'Black') {
                exploding = true;
            }
            this.pieces = this.pieces.filter(p => p !== targetPiece);
        }
        const oldX = piece.gridX;
        const oldY = piece.gridY;
        const startWasWronglyFlagged = this.isWronglyFlagged(oldX, oldY);
        piece.gridX = to.x;
        piece.gridY = to.y;
        piece.hasMoved = true;
        if (piece.color === 'White') {
            if (this.tiles[to.x][to.y].hasMine) {
                this.explode(to.x, to.y);
            }
            else if (!this.tiles[to.x][to.y].revealed) {
                this.revealTile(to.x, to.y);
            }
            // Check if there was a black piece that we just captured (already handled by targetPiece)
            if (targetPiece && targetPiece.color === 'Black') {
                exploding = true;
            }
        }
        if (exploding) {
            this.explode(to.x, to.y);
        }
        if (piece.color === 'Black') {
            const oldTile = this.tiles[oldX][oldY];
            const newTile = this.tiles[to.x][to.y];
            const oldHadMine = oldTile.hasMine;
            const newHadMine = newTile.hasMine;
            // Move the mine state
            oldTile.hasMine = newHadMine;
            newTile.hasMine = oldHadMine;
            // Handle revealed state swap
            const oldRevealed = oldTile.revealed;
            const newRevealed = newTile.revealed;
            oldTile.revealed = newRevealed;
            newTile.revealed = oldRevealed;
            // Handle flags swap? GML logic is a bit complex here.
            // GML updates minefield[grid_x][grid_y] based on _new_state.
            // Actually, my Tile structure combines these.
            // Destroy wrongly flagged tiles on path
            const path = [{ x: oldX, y: oldY }];
            const dx = Math.sign(to.x - oldX);
            const dy = Math.sign(to.y - oldY);
            if ((piece.type === 'Rook' || piece.type === 'Bishop' || piece.type === 'Queen' || piece.type === 'Pawn') && (dx === 0 || dy === 0 || Math.abs(to.x - oldX) === Math.abs(to.y - oldY))) {
                let currX = oldX + dx;
                let currY = oldY + dy;
                while (currX !== to.x || currY !== to.y) {
                    path.push({ x: currX, y: currY });
                    currX += dx;
                    currY += dy;
                    if (Math.abs(currX - oldX) > BOARD_SIZE || Math.abs(currY - oldY) > BOARD_SIZE)
                        break;
                }
            }
            path.push({ x: to.x, y: to.y });
            for (let i = 0; i < path.length; i++) {
                const p = path[i];
                const isWrong = (i === 0) ? startWasWronglyFlagged : this.isWronglyFlagged(p.x, p.y);
                if (isWrong) {
                    this.explode(p.x, p.y);
                }
            }
        }
        this.turn = (this.turn === 'White') ? 'Black' : 'White';
        this.checkWin();
        return true;
    }
    checkWin() {
        let blackKingFound = false;
        let whiteKingFound = false;
        let blackKingFlagged = false;
        for (const p of this.pieces) {
            if (p.type === 'King') {
                if (p.color === 'Black') {
                    blackKingFound = true;
                    if (this.tiles[p.gridX][p.gridY].isAntiFlagged)
                        blackKingFlagged = true;
                }
                else if (p.color === 'White') {
                    whiteKingFound = true;
                }
            }
        }
        if (!this.gameStarted) {
            if (blackKingFound && whiteKingFound)
                this.gameStarted = true;
            return { winner: null };
        }
        let allSolved = true;
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                if (!this.tiles[x][y].revealed && !this.tiles[x][y].hasMine && !this.getPieceAt(x, y)) {
                    // This condition is a bit simplified compared to GML which just checks for hidden tiles
                    // GML: if (_state == cell_state.hidden) _all_solved = false;
                    // Our 'hidden' is revealed=false. But mines and black pieces are also hidden in GML until revealed.
                    // Let's match GML:
                    if (!this.tiles[x][y].revealed) {
                        // In GML, revealed means it's not hidden.
                        // hidden_mine, hidden_black_piece etc are all "hidden" in the sense they aren't 'revealed'
                        // Wait, cell_state.hidden is just one state.
                        // GML reveal_tile sets state to cell_state.revealed.
                    }
                }
            }
        }
        // Re-evaluating allSolved based on GML:
        allSolved = true;
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                if (!this.tiles[x][y].revealed && !this.tiles[x][y].hasMine && !this.getPieceAt(x, y)) {
                    allSolved = false;
                    break;
                }
            }
            if (!allSolved)
                break;
        }
        if (!blackKingFound)
            return { winner: 'White' };
        if (!whiteKingFound)
            return { winner: 'Black' };
        if (blackKingFlagged && this.turn === 'Black')
            return { winner: 'White' };
        if (allSolved)
            return { winner: 'Draw' }; // Or whoever has more points? GML just ends game.
        return { winner: null };
    }
    syncFromPackets(packets) {
        // Clear current pieces as they will be recreated from packets
        this.pieces = [];
        for (const packet of packets) {
            const tile = this.tiles[packet.x][packet.y];
            tile.revealed = packet.state === CellState.REVEALED;
            if (packet.mineCount !== undefined) {
                tile.mineCount = packet.mineCount;
            }
            if (packet.state === CellState.FLAGGED) {
                // We'll set a dummy flagValue for now, 
                // it might be overwritten if it's a piece
                tile.flagValue = 1;
            }
            else {
                tile.flagValue = 0;
                tile.isAntiFlagged = false;
            }
            if (packet.piece) {
                const [colorStr, typeStr] = packet.piece.split('_');
                const color = (colorStr.charAt(0).toUpperCase() + colorStr.slice(1));
                const type = (typeStr.charAt(0).toUpperCase() + typeStr.slice(1));
                const piece = new Piece(type, color, packet.x, packet.y);
                this.pieces.push(piece);
                if (packet.state === CellState.FLAGGED) {
                    if (type === 'King')
                        tile.isAntiFlagged = true;
                    else
                        tile.flagValue = piece.value;
                }
            }
        }
    }
}
//# sourceMappingURL=Board.js.map