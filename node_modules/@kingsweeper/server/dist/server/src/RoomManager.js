import { GameState } from './GameState.js';
export class RoomManager {
    io;
    rooms = new Map();
    players = new Map();
    constructor(io) {
        this.io = io;
    }
    handleConnection(socket) {
        socket.on('joinRoom', (roomId) => {
            this.joinRoom(socket, roomId);
        });
        socket.on('move', (data) => {
            this.handleMove(socket, data);
        });
        socket.on('disconnect', () => {
            this.handleDisconnect(socket);
        });
    }
    joinRoom(socket, roomId) {
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
        const player = {
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
    handleMove(socket, data) {
        const player = this.players.get(socket.id);
        if (!player)
            return;
        const game = this.rooms.get(player.room);
        if (!game)
            return;
        game.handleMove(player.id, player.color, data);
    }
    handleDisconnect(socket) {
        const player = this.players.get(socket.id);
        if (!player)
            return;
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
//# sourceMappingURL=RoomManager.js.map