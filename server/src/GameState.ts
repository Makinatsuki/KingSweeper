import { Server, Socket } from 'socket.io';
import { Board, BOARD_SIZE } from '../../shared/Board';
import { Color } from '../../shared/Piece';
import { CellState, MovePacket, SyncPacket } from '../../shared/types';

export class GameState {
    private roomId: string;
    private io: Server;
    private board: Board;
    private players: Map<string, Color> = new Map();

    constructor(roomId: string, io: Server) {
        this.roomId = roomId;
        this.io = io;
        this.board = new Board();
        this.board.initialize();
    }

    addPlayer(_playerId: string): Color | null {
        if (this.players.size >= 2) return null;
        
        const color: Color = this.players.size === 0 ? 'White' : 'Black';
        this.players.set(_playerId, color);
        
        if (this.players.size === 2) {
            this.broadcast('gameStart', { turn: this.board.turn });
        }
        
        return color;
    }

    removePlayer(playerId: string) {
        this.players.delete(playerId);
    }

    isEmpty(): boolean {
        return this.players.size === 0;
    }

    handleMove(_playerId: string, color: Color, move: MovePacket) {
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
        } else {
            // Send sync back to client to correct their state if move failed
            const socketId = Array.from(this.players.entries()).find(([_, c]) => c === color)?.[0];
            if (socketId) {
                const socket = this.io.sockets.sockets.get(socketId);
                if (socket) this.sync(socket);
            }
        }
    }

    sync(socket: Socket) {
        const playerColor = this.players.get(socket.id);
        if (!playerColor) return;

        const packets = this.generateSyncPackets(playerColor);
        socket.emit('sync', {
            tiles: packets,
            turn: this.board.turn,
            gameStarted: this.board.gameStarted
        });
    }

    private broadcastState() {
        for (const [socketId, _color] of this.players.entries()) {
            const socket = this.io.sockets.sockets.get(socketId);
            if (socket) {
                this.sync(socket);
            }
        }
    }

    private broadcast(event: string, data: any) {
        this.io.to(this.roomId).emit(event, data);
    }

    private generateSyncPackets(playerColor: Color): SyncPacket[] {
        const packets: SyncPacket[] = [];
        
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                const tile = this.board.tiles[x][y];
                const piece = this.board.getPieceAt(x, y);
                
                let state = CellState.HIDDEN;
                if (tile.revealed) state = CellState.REVEALED;
                else if (tile.flagValue > 0 || tile.isAntiFlagged) state = CellState.FLAGGED;

                const packet: SyncPacket = { x, y, state };

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
                } else {
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
