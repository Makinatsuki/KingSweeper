import { Board, BOARD_SIZE } from '../../shared/Board.js';
import { CellState } from '../../shared/types.js';
export class GameState {
    roomId;
    io;
    board;
    players = new Map();
    constructor(roomId, io) {
        this.roomId = roomId;
        this.io = io;
        this.board = new Board();
        this.board.initialize();
    }
    addPlayer(_playerId) {
        if (this.players.size >= 2)
            return null;
        const color = this.players.size === 0 ? 'White' : 'Black';
        this.players.set(_playerId, color);
        if (this.players.size === 2) {
            this.broadcast('gameStart', { turn: this.board.turn });
        }
        return color;
    }
    removePlayer(playerId) {
        this.players.delete(playerId);
    }
    isEmpty() {
        return this.players.size === 0;
    }
    handleMove(_playerId, color, move) {
        if (this.board.turn !== color) {
            return;
        }
        const success = this.board.makeMove(move.from, move.to, move.type, color);
        if (success) {
            this.broadcastState();
            const winStatus = this.board.checkWin();
            if (winStatus.winner) {
                this.broadcast('gameOver', winStatus);
            }
        }
        else {
            // Send sync back to client to correct their state if move failed
            const socketId = Array.from(this.players.entries()).find(([_, c]) => c === color)?.[0];
            if (socketId) {
                const socket = this.io.sockets.sockets.get(socketId);
                if (socket)
                    this.sync(socket);
            }
        }
    }
    sync(socket) {
        const playerColor = this.players.get(socket.id);
        if (!playerColor)
            return;
        const packets = this.generateSyncPackets(playerColor);
        socket.emit('sync', {
            tiles: packets,
            turn: this.board.turn,
            gameStarted: this.board.gameStarted
        });
    }
    broadcastState() {
        for (const [socketId, _color] of this.players.entries()) {
            const socket = this.io.sockets.sockets.get(socketId);
            if (socket) {
                this.sync(socket);
            }
        }
    }
    broadcast(event, data) {
        this.io.to(this.roomId).emit(event, data);
    }
    generateSyncPackets(playerColor) {
        const packets = [];
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                const tile = this.board.tiles[x][y];
                const piece = this.board.getPieceAt(x, y);
                let state = CellState.HIDDEN;
                if (tile.revealed)
                    state = CellState.REVEALED;
                else if (tile.flagValue > 0 || tile.isAntiFlagged)
                    state = CellState.FLAGGED;
                const packet = { x, y, state };
                // Visibility Control:
                // 1. If revealed, show mine count and any piece there.
                // 2. If not revealed, only show pieces owned by the player.
                // 3. Black player can see all black pieces (as they are the "mines").
                // 4. White player only sees their own pieces unless revealed.
                if (tile.revealed) {
                    packet.mineCount = this.board.countAdjacentMines(x, y);
                    if (piece) {
                        packet.piece = `${piece.color.toLowerCase()}_${piece.type.toLowerCase()}`;
                    }
                }
                else {
                    if (piece) {
                        if (piece.color === playerColor || playerColor === 'Black') {
                            packet.piece = `${piece.color.toLowerCase()}_${piece.type.toLowerCase()}`;
                        }
                    }
                }
                packets.push(packet);
            }
        }
        return packets;
    }
}
//# sourceMappingURL=GameState.js.map