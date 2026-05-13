import { io, Socket } from 'socket.io-client';
import { MovePacket, SyncPacket } from '../../../shared/types';
import { Color } from '../../../shared/Piece';

export class Network {
    private static instance: Network;
    private socket: Socket;
    public playerColor: Color | null = null;
    public roomId: string | null = null;

    private constructor() {
        // In production this would be the server URL, but for local dev with Vite proxy or direct port
        this.socket = io('http://localhost:3000');
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
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
