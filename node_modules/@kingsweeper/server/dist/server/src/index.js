import { Server } from 'socket.io';
import { createServer } from 'http';
import { RoomManager } from './RoomManager.js';
const httpServer = createServer();
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
httpServer.listen(PORT, () => {
    console.log(`KingSweeper Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map