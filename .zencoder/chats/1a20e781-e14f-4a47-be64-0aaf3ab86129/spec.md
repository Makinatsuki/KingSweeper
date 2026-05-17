# Technical Specification: KingSweeper Backend/Frontend Split

## Technical Context
- **Game Engine**: GameMaker (HTML5 Export)
- **Backend Host**: Render (Node.js/Express)
- **Frontend Host**: GitHub Pages (Static HTML/CSS/JS)
- **Communication**: Iframe embedding / PostMessage (if needed)

## Implementation Approach
The project will be split into two main directories: `backend/` and `frontend/`.

### 1. Backend (Render)
- **Role**: Handles "processing and visuals" by hosting the core game engine and assets.
- **Tech Stack**: Node.js with Express.
- **Functionality**:
    - Serves the compiled GameMaker HTML5 files (`html5game/` directory).
    - Serves a `game.html` (original `index.html`) which initializes the GameMaker runner.
    - Configured for deployment on Render as a Web Service.

### 2. Frontend (GitHub Pages)
- **Role**: Handles "instructions" and serves as the primary entry point for users.
- **Tech Stack**: Static HTML/CSS/JS.
- **Functionality**:
    - Displays game instructions, controls, and metadata.
    - Embeds the backend visuals using an `<iframe>` pointing to the Render URL.
    - Provides a clean UI that wraps the game experience.

## Source Code Structure Changes
```text
/
├── backend/
│   ├── public/
│   │   ├── html5game/          # Moved from root
│   │   └── game.html           # Renamed from index.html
│   ├── server.js               # New Express server
│   ├── package.json            # New Node.js config
│   └── .env                    # Environment variables
├── frontend/
│   ├── index.html              # New entry point with instructions and iframe
│   ├── style.css               # New styling for the frontend wrapper
│   └── script.js               # Optional: handling communication with backend
└── (Original root files will be cleaned up/moved)
```

## Data Model / API / Interface Changes
- **Interface**: The frontend will communicate with the backend primarily through the `iframe` source.
- **Environment Variables**: `BACKEND_URL` will be used in the frontend to point to the Render deployment.

## Verification Approach
1. **Local Backend Test**: Run the Express server locally and verify the game loads at `http://localhost:3000/game.html`.
2. **Local Frontend Test**: Open `frontend/index.html` and verify it correctly embeds the local backend.
3. **Build Check**: Ensure all assets in `html5game/` are correctly referenced after moving.
4. **Linting**: Run basic JS linting on the new `server.js`.
