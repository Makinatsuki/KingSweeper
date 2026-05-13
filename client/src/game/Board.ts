import { Container, Sprite } from 'pixi.js';
import { BOARD_SIZE, Board as SharedBoard } from '../../../shared/Board';
import { AssetLoader } from '../core/AssetLoader';

export const TILE_SIZE = 32;

export class BoardView {
    public container: Container;
    private tileSprites: Sprite[][];
    private sharedBoard: SharedBoard;

    constructor(sharedBoard: SharedBoard) {
        this.container = new Container();
        this.tileSprites = [];
        this.sharedBoard = sharedBoard;

        for (let x = 0; x < BOARD_SIZE; x++) {
            this.tileSprites[x] = [];
            for (let y = 0; y < BOARD_SIZE; y++) {
                const sprite = new Sprite(AssetLoader.getTexture('Tiles_0'));
                sprite.x = x * TILE_SIZE;
                sprite.y = y * TILE_SIZE;
                sprite.width = TILE_SIZE;
                sprite.height = TILE_SIZE;
                this.container.addChild(sprite);
                this.tileSprites[x][y] = sprite;
            }
        }
    }

    public update() {
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                const tile = this.sharedBoard.tiles[x][y];
                const sprite = this.tileSprites[x][y];
                
                if (tile.revealed) {
                    const mineCount = tile.mineCount;
                    sprite.texture = AssetLoader.getTexture(`Numbers_${mineCount}`);
                    sprite.tint = 0xffffff;
                } else {
                    if (tile.flagValue > 0) {
                        // Use Numbers_Colors to show the flag value (1, 3, 5, 9)
                        sprite.texture = AssetLoader.getTexture(`Numbers_Colors_${tile.flagValue}`);
                        sprite.tint = 0xffffff;
                    } else if (tile.isAntiFlagged) {
                        // King anti-flag
                        sprite.texture = AssetLoader.getTexture('Numbers_Colors_0'); // Using 0 as a special indicator for King
                        sprite.tint = 0xff00ff; // Magenta for King anti-flag
                    } else {
                        sprite.texture = AssetLoader.getTexture('Tiles_0');
                        sprite.tint = 0xffffff;
                    }
                }
            }
        }
    }

    public getGridPosition(worldX: number, worldY: number): { x: number, y: number } | null {
        const x = Math.floor(worldX / TILE_SIZE);
        const y = Math.floor(worldY / TILE_SIZE);
        if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
            return { x, y };
        }
        return null;
    }
}
