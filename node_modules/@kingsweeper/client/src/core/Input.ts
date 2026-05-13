import { Renderer } from './Renderer';
import { Vector2 } from '../../../shared/types';
import { BoardView } from '../game/Board';

export class Input {
    private renderer: Renderer;
    private boardView: BoardView;
    public onLeftClick: (gridPos: Vector2) => void = () => {};
    public onRightClick: (gridPos: Vector2) => void = () => {};

    constructor(boardView: BoardView) {
        this.renderer = Renderer.getInstance();
        this.boardView = boardView;

        this.renderer.app.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.renderer.app.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    private handleMouseDown(e: MouseEvent) {
        const rect = this.renderer.app.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Convert to world coordinates
        const worldPos = this.renderer.world.toLocal({ x, y });
        const gridPos = this.boardView.getGridPosition(worldPos.x, worldPos.y);

        if (gridPos) {
            if (e.button === 0) {
                this.onLeftClick(gridPos);
            } else if (e.button === 2) {
                this.onRightClick(gridPos);
            }
        }
    }
}
