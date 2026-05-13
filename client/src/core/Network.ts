import { io, Socket } from 'socket.io-client';
import { MovePacket, SyncPacket } from '../../../shared/types';
import { Color } from '../../../shared/Piece';

export class Network {
    private static instance: Network;
    private socket: Socket;
    public playerColor: Color | null = null;
    public roomId: string | null = null;

    private constructor() {
        // Use environment variable for server URL, fallback to localhost for development
        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
        this.socket = io(serverUrl);
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Connection error:', err.message);
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('Disconnected:', reason);
        });

        this.socket.on('joined', (data: { roomId: string, color: Color }) => {
            this.roomId = data.roomId;
            this.playerColor = data.color;
            console.log(`Joined room ${data.roomId} as ${data.color}`);
        });

        this.socket.on('error', (msg: string) => {
            alert(msg);
        });
    }

    public static getInstance(): Network {
        if (!Network.instance) {
            Network.instance = new Network();
        }
        return Network.instance;
    }

    public joinRoom(roomId: string) {
        this.socket.emit('joinRoom', roomId);
    }

    public sendMove(move: MovePacket) {
        this.socket.emit('move', move);
    }

    public onSync(callback: (data: { tiles: SyncPacket[], turn: Color, gameStarted: boolean }) => void) {
        this.socket.on('sync', callback);
    }

    public onGameStart(callback: (data: { turn: Color }) => void) {
        this.socket.on('gameStart', callback);
    }

    public onGameOver(callback: (data: { winner: Color, reason: string }) => void) {
        this.socket.on('gameOver', callback);
    }

    public onJoined(callback: (data: { roomId: string, color: Color }) => void) {
        this.socket.on('joined', callback);
    }
}
