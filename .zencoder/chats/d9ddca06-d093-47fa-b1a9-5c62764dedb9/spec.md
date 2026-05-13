# Technical Specification - KingSweeper Browser Conversion

## Technical Context
- **Language**: TypeScript (Strict mode)
- **Frontend Framework**: PixiJS (v8) for high-performance 2D rendering.
- **Backend Framework**: Node.js with Socket.io for real-time multiplayer.
- **Build Tool**: Vite (for fast development and bundling).
- **Communication Protocol**: WebSockets via Socket.io.

## Implementation Approach

### 1. Core Logic Migration
- Port the GML logic from `Minefield` and `Pieces` objects to TypeScript classes.
- Use a **Component-Based Architecture** or a clean **Entity-Component-System (ECS)** approach if complexity warrants, but a standard OOP approach (e.g., `Game`, `Board`, `Piece` classes) should suffice for this scale.
- **Board Representation**: A 2D array or a single typed array representing the grid state (revealed, hidden, mine, piece type, etc.).

### 2. Multiplayer Architecture
- **Server-Authoritative Model**: To prevent cheating and ensure consistency, the server will maintain the "true" state of the board (mine positions, piece locations).
- **Client Prediction**: Minimal prediction for piece movement; validation on the server.
- **Visibility Control**: The server will only send "revealed" tile data and own-piece data to clients, preventing players from seeing the full board through the network tab.

### 3. Frontend Rendering
- **Tilemap Rendering**: Efficiently render the 32x32 grid using PixiJS `Container` and `Sprite` pooling.
- **Assets**: Extract PNGs from the GameMaker project and organize them into an `assets/` directory.
- **Dual POV**: Implement two camera views (or separate client renders) to handle White and Black perspectives.

## Source Code Structure Changes
```text
/
├── server/
│   ├── src/
│   │   ├── GameState.ts       # Core game logic and state
│   │   ├── RoomManager.ts     # Room/Lobby management
│   │   └── index.ts           # Socket.io server entry
├── client/
│   ├── public/
│   │   └── assets/            # Sprites and sounds
│   ├── src/
│   │   ├── core/
│   │   │   ├── Renderer.ts    # PixiJS setup
│   │   │   ├── Input.ts       # Mouse/Keyboard handling
│   │   │   └── Network.ts     # Socket.io client
│   │   ├── game/
│   │   │   ├── Board.ts       # Visual grid representation
│   │   │   └── Piece.ts       # Visual piece representation
│   │   └── main.ts            # Application entry
└── shared/                    # Shared types and constants
    └── types.ts
```

## Data Model / API Changes
- **Cell State**: Mirror the `cell_state` enum from GML.
- **Move Packet**: `{ from: {x, y}, to: {x, y}, type: 'move' | 'flag' }`.
- **Sync Packet**: Partial board updates `{ x, y, state }[]`.

## Verification Approach
- **Unit Tests**: Test the movement logic (e.g., Rook sliding, King adjacency) in isolation using Vitest.
- **Integration Tests**: Simulate two clients connecting and playing a game.
- **Manual Verification**: Verify that the split POV works correctly for both players.
