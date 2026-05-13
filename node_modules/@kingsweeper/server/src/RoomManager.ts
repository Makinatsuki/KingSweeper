import { Server, Socket } from 'socket.io';
import { GameState } from './GameState';
import { Color } from '../../shared/Piece';

interface Player {
    id: string;
    socket: Socket;
    color: Color;
    room: string;
}

export class RoomManager {
    private io: Server;
    private rooms: Map<string, GameState> = new Map();
    private players: Map<string, Player> = new Map();

    constructor(io: Server) {
        this.io = io;
    }

    handleConnection(socket: Socket) {
        socket.on('joinRoom', (roomId: string) => {
            this.joinRoom(socket, roomId);
        });

        socket.on('move', (data: any) => {
            this.handleMove(socket, data);
        });

        socket.on('disconnect', () => {
            this.handleDisconnect(socket);
        });
    }

    private joinRoom(socket: Socket, roomId: string) {
        let game = this.rooms.get(roomId);
        if (!game) {
            game = new GameState(roomId, this.io);
            this.rooms.set(roomId, game);
        }

        const color = game.addPlayer(socket.id);
        if (!color) {
            socket.emit('error', 'Room is full');
            return;
        }

        const player: Player = {
            id: socket.id,
            socket,
            color,
            room: roomId
        };

        this.players.set(socket.id, player);
        socket.join(roomId);
        
        socket.emit('joined', { roomId, color });
        game.sync(socket);
        
        console.log(`Player ${socket.id} joined room ${roomId} as ${color}`);
    }

    private handleMove(socket: Socket, data: any) {
        const player = this.players.get(socket.id);
        if (!player) return;

        const game = this.rooms.get(player.room);
        if (!game) return;

        game.handleMove(player.id, player.color, data);
    }

    private handleDisconnect(socket: Socket) {
        const player = this.players.get(socket.id);
        if (!player) return;

        const game = this.rooms.get(player.room);
        if (game) {
            game.removePlayer(player.id);
            if (game.isEmpty()) {
                this.rooms.delete(player.room);
                console.log(`Room ${player.room} deleted because it is empty`);
            }
        }

        this.players.delete(socket.id);
        console.log(`Player ${socket.id} disconnected`);
    }
}
