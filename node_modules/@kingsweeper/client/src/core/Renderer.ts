import { Application, Container } from 'pixi.js';
import { BOARD_SIZE } from '../../../shared/Board';
import { TILE_SIZE } from '../game/Board';

export class Renderer {
    private static instance: Renderer;
    public app: Application;
    public boardLayer: Container;
    public pieceLayer: Container;
    public uiLayer: Container;
    public world: Container;

    private constructor() {
        this.app = new Application();
        this.world = new Container();
        this.boardLayer = new Container();
        this.pieceLayer = new Container();
        this.uiLayer = new Container();

        this.world.addChild(this.boardLayer);
        this.world.addChild(this.pieceLayer);
        this.world.addChild(this.uiLayer);
    }

    public static getInstance(): Renderer {
        if (!Renderer.instance) {
            Renderer.instance = new Renderer();
        }
        return Renderer.instance;
    }

    public async init(containerId: string): Promise<void> {
        await this.app.init({
            width: 1024,
            height: 1024,
            backgroundColor: 0x1e1e1e,
            antialias: true,
        });

        const container = document.getElementById(containerId);
        if (container) {
            container.appendChild(this.app.canvas);
        }

        this.app.stage.addChild(this.world);
    }

    public setViewCenter(x: number, y: number) {
        this.world.pivot.set(x, y);
        this.world.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    }

    public setPOV(color: 'White' | 'Black') {
        if (color === 'White') {
            this.world.rotation = 0;
            this.setViewCenter((BOARD_SIZE * TILE_SIZE) / 2, (BOARD_SIZE * TILE_SIZE) / 2);
        } else {
            this.world.rotation = Math.PI;
            this.setViewCenter((BOARD_SIZE * TILE_SIZE) / 2, (BOARD_SIZE * TILE_SIZE) / 2);
        }
    }
}
