import { Server } from 'socket.io';
import { createServer } from 'http';
import { RoomManager } from './RoomManager.js';

console.log('Starting KingSweeper Server...');

const httpServer = createServer((req, res) => {
    if (req.url === '/' || req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('KingSweeper Server is running');
        return;
    }
    res.writeHead(404);
    res.end();
});
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    }
});

const roomManager = new RoomManager(io);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    roomManager.handleConnection(socket);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`KingSweeper Server running on port ${PORT}`);
});
