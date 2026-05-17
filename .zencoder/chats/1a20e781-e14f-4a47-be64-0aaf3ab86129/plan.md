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

Save the output to `c:\Users\HP Laptop\GameMakerProjects\KingSweeper\KingSweeper\.zencoder\chats\1a20e781-e14f-4a47-be64-0aaf3ab86129/spec.md` with:

- Technical context (language, dependencies)
- Implementation approach
- Source code structure changes
- Data model / API / interface changes
- Verification approach

If the task is complex enough, create a detailed implementation plan based on `c:\Users\HP Laptop\GameMakerProjects\KingSweeper\KingSweeper\.zencoder\chats\1a20e781-e14f-4a47-be64-0aaf3ab86129/spec.md`:

- Break down the work into concrete tasks (incrementable, testable milestones)
- Each task should reference relevant contracts and include verification steps
- Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function).

Save to `c:\Users\HP Laptop\GameMakerProjects\KingSweeper\KingSweeper\.zencoder\chats\1a20e781-e14f-4a47-be64-0aaf3ab86129/plan.md`. If the feature is trivial and doesn't warrant this breakdown, keep the Implementation step below as is.

**Stop here.** Present the specification (and plan, if created) to the user and wait for their confirmation before proceeding.

---

### [x] Step: Setup Backend Directory Structure
- Create `backend/` and `backend/public/` directories.
- Move `html5game/` and `index.html` (renamed to `game.html`) to `backend/public/`.
- **Verification**: Check directory tree to ensure correct placement.

### [x] Step: Initialize Backend Node.js App
- Create `backend/package.json` with necessary dependencies (express, cors).
- Create `backend/server.js` to serve static files from `public/`.
- **Verification**: Run `npm install` and `node server.js`, then visit `http://localhost:3000/game.html`.

### [x] Step: Setup Frontend Directory Structure
- Create `frontend/` directory.
- **Verification**: Check directory tree.

### [x] Step: Implement Frontend UI and Instructions
- Create `frontend/index.html` as the main entry point for GitHub Pages.
- Add "Instructions" section and an `<iframe>` targeting the backend.
- **Verification**: Open `frontend/index.html` in a browser and verify the layout.

### [x] Step: Add Frontend Styling and Logic
- Create `frontend/style.css` for a professional "instructional" layout.
- Create `frontend/script.js` to handle any necessary UI interactions or backend communication.
- **Verification**: Verify the UI looks correct and responsive.

### [x] Step: Final Cleanup and Verification
- Remove original root files that were moved to subdirectories.
- Ensure `backend/.gitignore` and `frontend/.gitignore` are set if needed.
- Write a report to `report.md`.
- **Verification**: Final manual verification of the end-to-end flow.
