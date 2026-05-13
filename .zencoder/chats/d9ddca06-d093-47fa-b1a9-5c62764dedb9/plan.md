# Spec and build

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:

- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Step: Technical Specification

Assess the task's difficulty, as underestimating it leads to poor outcomes.

- easy: Straightforward implementation, trivial bug fix or feature
- medium: Moderate complexity, some edge cases or caveats to consider
- hard: Complex logic, many caveats, architectural considerations, or high-risk changes

Create a technical specification for the task that is appropriate for the complexity level:

- Review the existing codebase architecture and identify reusable components.
- Define the implementation approach based on established patterns in the project.
- Identify all source code files that will be created or modified.
- Define any necessary data model, API, or interface changes.
- Describe verification steps using the project's test and lint commands.

Save the output to `c:\Users\HP Laptop\GameMakerProjects\KingSweeper\.zencoder\chats\d9ddca06-d093-47fa-b1a9-5c62764dedb9/spec.md` with:

- Technical context (language, dependencies)
- Implementation approach
- Source code structure changes
- Data model / API / interface changes
- Verification approach

If the task is complex enough, create a detailed implementation plan based on `c:\Users\HP Laptop\GameMakerProjects\KingSweeper\.zencoder\chats\d9ddca06-d093-47fa-b1a9-5c62764dedb9/spec.md`:

- Break down the work into concrete tasks (incrementable, testable milestones)
- Each task should reference relevant contracts and include verification steps
- Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function).

Save to `c:\Users\HP Laptop\GameMakerProjects\KingSweeper\.zencoder\chats\d9ddca06-d093-47fa-b1a9-5c62764dedb9/plan.md`. If the feature is trivial and doesn't warrant this breakdown, keep the Implementation step below as is.

**Stop here.** Present the specification (and plan, if created) to the user and wait for their confirmation before proceeding.

---

### [x] Step: Project Initialization
Set up the TypeScript project with Vite (client) and Node.js (server). Initialize Socket.io and PixiJS.
- Create folder structure as per spec.
- Install dependencies (pixi.js, socket.io, socket.io-client, typescript, vite).
- Configure `tsconfig.json` and `package.json`.

### [x] Step: Asset Extraction and Loading
Extract all PNG assets from the GameMaker project and set up a loader in PixiJS.
- Move PNGs to `client/public/assets/`.
- Implement an `AssetLoader` class to load textures.

### [x] Step: Core Logic Implementation (Shared)
Implement the Minesweeper + Chess logic in a shared library to be used by both server and client.
- Implement `Board` class with grid generation (mines, pieces).
- Implement `Piece` class with legal move calculations (Rook, Bishop, Queen, Knight, King, Pawn).
- Implement game rules (flagging, revealing, immobilization, boundary rules).

### [x] Step: Server Development
Implement the authoritative game server.
- Manage game rooms and player connections.
- Handle move/flag requests and validate them using shared logic.
- Broadcast state updates to clients.

### [x] Step: Frontend Development - Board & Rendering
Implement the visual representation of the game.
- Render the 32x32 grid using PixiJS.
- Implement dual POV (split screen or perspective toggle).
- Handle mouse interactions (click to reveal/select, right-click to flag).

### [x] Step: Frontend Development - Networking & UI
Connect the frontend to the server and add basic UI.
- Implement Socket.io client integration.
- Add UI for turn indicators, game over messages, and room joining.

### [x] Step: Verification & Final Polish
Verify all features and perform manual testing.
- Run unit tests for logic.
- Verify online multiplayer between two browser tabs.
- Final report to `report.md`.
