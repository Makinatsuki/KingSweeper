import './style.css';
import { Board } from '../../shared/Board';
import { AssetLoader } from './core/AssetLoader';
import { Renderer } from './core/Renderer';
import { BoardView } from './game/Board';
import { PieceView } from './game/Piece';
import { Input } from './core/Input';
import { Network } from './core/Network';
import { Color } from '../../shared/Piece';

async function init() {
    // Load Assets
    await AssetLoader.load();

    // Initialize Renderer
    const renderer = Renderer.getInstance();
    await renderer.init('app');

    // Initialize Shared Logic
    const sharedBoard = new Board();
    // No need to initialize locally if we are joining a room, 
    // but good to have a blank state.

    // Initialize Views
    const boardView = new BoardView(sharedBoard);
    const pieceView = new PieceView(sharedBoard.pieces);

    renderer.boardLayer.addChild(boardView.container);
    renderer.pieceLayer.addChild(pieceView.container);

    // Initialize Input
    const input = new Input(boardView);
    const network = Network.getInstance();

    // UI Elements
    const lobby = document.getElementById('lobby')!;
    const roomInput = document.getElementById('room-input') as HTMLInputElement;
    const joinBtn = document.getElementById('join-btn') as HTMLButtonElement;
    const statusBar = document.getElementById('status-bar')!;
    const roomInfo = document.getElementById('room-info')!;
    const colorInfo = document.getElementById('color-info')!;
    const turnInfo = document.getElementById('turn-info')!;

    let selectedPiecePos: {x: number, y: number} | null = null;

    joinBtn.onclick = () => {
        const roomId = roomInput.value.trim();
        if (roomId) {
            network.joinRoom(roomId);
        }
    };

    network.onJoined((data) => {
        lobby.style.display = 'none';
        statusBar.style.display = 'block';
        roomInfo.innerText = `Room: ${data.roomId}`;
        colorInfo.innerText = `Playing as: ${data.color}`;
        renderer.setPOV(data.color);
    });

    network.onSync((data) => {
        sharedBoard.syncFromPackets(data.tiles);
        sharedBoard.turn = data.turn;
        
        if (data.gameStarted) {
            updateTurnUI(data.turn);
        } else {
            turnInfo.innerText = 'Waiting for players...';
        }
    });

    network.onGameStart((data) => {
        updateTurnUI(data.turn);
    });

    network.onGameOver((data) => {
        turnInfo.innerText = `GAME OVER - ${data.winner.toUpperCase()} WINS! (${data.reason})`;
        alert(`Game Over: ${data.winner} wins!`);
    });

    function updateTurnUI(turn: Color) {
        turnInfo.innerText = `${turn.toUpperCase()}'s Turn`;
        turnInfo.className = turn === 'White' ? 'turn-white' : 'turn-black';
    }

    input.onLeftClick = (pos) => {
        if (!network.playerColor || sharedBoard.turn !== network.playerColor) return;

        const piece = sharedBoard.getPieceAt(pos.x, pos.y);
        
        if (selectedPiecePos) {
            // Try to move
            network.sendMove({
                from: selectedPiecePos,
                to: pos,
                type: 'move'
            });
            selectedPiecePos = null;
        } else {
            if (piece && piece.color === network.playerColor) {
                selectedPiecePos = pos;
            }
        }
    };

    input.onRightClick = (pos) => {
        if (!network.playerColor || sharedBoard.turn !== network.playerColor) return;

        if (selectedPiecePos) {
            network.sendMove({
                from: selectedPiecePos,
                to: pos,
                type: 'flag'
            });
            selectedPiecePos = null;
        }
    };

    // Simple game loop
    renderer.app.ticker.add(() => {
        boardView.update();
        pieceView.update();
    });

    console.log('KingSweeper Client Initialized');
}

init();
